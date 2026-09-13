import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getTokens: vi.fn(),
  removeTokens: vi.fn(),
  getItem: vi.fn(),
  removeItem: vi.fn(),
  setItem: vi.fn(),
  setTokens: vi.fn(),
  getConfiguration: vi.fn(),
}));

vi.mock("@raycast/api", () => ({
  LocalStorage: {
    getItem: mocks.getItem,
    removeItem: mocks.removeItem,
    setItem: mocks.setItem,
  },
  OAuth: {
    RedirectMethod: { Web: "web" },
    PKCEClient: class {
      getTokens = mocks.getTokens;
      removeTokens = mocks.removeTokens;
      setTokens = mocks.setTokens;
    },
  },
}));

vi.mock("./config", () => ({
  getJumpseatConfiguration: mocks.getConfiguration,
}));

import {
  clearJumpseatAuthorization,
  refreshJumpseatAccessToken,
} from "./oauth";

describe("clearJumpseatAuthorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getTokens.mockResolvedValue(undefined);
    mocks.getItem.mockResolvedValue(undefined);
    mocks.removeTokens.mockResolvedValue(undefined);
    mocks.removeItem.mockResolvedValue(undefined);
    mocks.setItem.mockResolvedValue(undefined);
    mocks.setTokens.mockResolvedValue(undefined);
    mocks.getConfiguration.mockReturnValue({
      apiBaseUrl: "https://api.withjumpseat.com",
      webBaseUrl: "https://app.withjumpseat.com",
      authBaseUrl: "https://auth.withjumpseat.com",
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("deletes local credentials even when revocation metadata cannot be read", async () => {
    mocks.getItem.mockRejectedValue(new Error("storage read failed"));

    await expect(clearJumpseatAuthorization()).resolves.toBeUndefined();

    expect(mocks.removeTokens).toHaveBeenCalledOnce();
    expect(mocks.removeItem).toHaveBeenCalledTimes(3);
  });

  it("reports a local token deletion failure after starting every cleanup", async () => {
    mocks.removeTokens.mockRejectedValue(new Error("token deletion failed"));

    await expect(clearJumpseatAuthorization()).rejects.toThrow(
      "token deletion failed",
    );

    expect(mocks.removeItem).toHaveBeenCalledTimes(3);
  });

  it("refreshes a central grant at its persisted trusted issuer", async () => {
    mocks.getTokens.mockResolvedValue({ refreshToken: "persisted-refresh" });
    mocks.getItem.mockImplementation((key: string) => {
      const values: Record<string, string | undefined> = {
        "jumpseat-auth-configuration": "https://api.withjumpseat.com",
        "jumpseat-auth-protocol": "central",
        "jumpseat-auth-issuer": "https://auth.withjumpseat.com",
      };
      return Promise.resolve(values[key]);
    });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: "refreshed-access",
          refresh_token: "refreshed-refresh",
          token_type: "Bearer",
          expires_in: 3600,
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      refreshJumpseatAccessToken({
        apiBaseUrl: "https://api.withjumpseat.com",
        webBaseUrl: "https://app.withjumpseat.com",
        authBaseUrl: "https://auth-next.withjumpseat.com",
      }),
    ).resolves.toBe("refreshed-access");

    expect(fetchMock).toHaveBeenCalledWith(
      new URL("https://auth.withjumpseat.com/oauth/token"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("best-effort revokes a central grant at its persisted trusted issuer", async () => {
    mocks.getConfiguration.mockReturnValue({
      apiBaseUrl: "https://api.withjumpseat.com",
      webBaseUrl: "https://app.withjumpseat.com",
      authBaseUrl: "https://auth-next.withjumpseat.com",
    });
    mocks.getTokens.mockResolvedValue({ refreshToken: "persisted-refresh" });
    mocks.getItem.mockImplementation((key: string) => {
      const values: Record<string, string | undefined> = {
        "jumpseat-auth-configuration": "https://api.withjumpseat.com",
        "jumpseat-auth-protocol": "central",
        "jumpseat-auth-issuer": "https://auth.withjumpseat.com",
      };
      return Promise.resolve(values[key]);
    });
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await expect(clearJumpseatAuthorization()).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      new URL("https://auth.withjumpseat.com/oauth/revoke"),
      expect.objectContaining({ method: "POST" }),
    );
    expect(mocks.removeTokens).toHaveBeenCalledOnce();
  });
});
