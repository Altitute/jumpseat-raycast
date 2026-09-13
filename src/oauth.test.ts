import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getTokens: vi.fn(),
  removeTokens: vi.fn(),
  getItem: vi.fn(),
  removeItem: vi.fn(),
}));

vi.mock("@raycast/api", () => ({
  LocalStorage: {
    getItem: mocks.getItem,
    removeItem: mocks.removeItem,
    setItem: vi.fn(),
  },
  OAuth: {
    RedirectMethod: { Web: "web" },
    PKCEClient: class {
      getTokens = mocks.getTokens;
      removeTokens = mocks.removeTokens;
    },
  },
}));

vi.mock("./config", () => ({
  getJumpseatConfiguration: () => ({
    apiBaseUrl: "https://api.withjumpseat.com",
    webBaseUrl: "https://app.withjumpseat.com",
    authBaseUrl: "https://auth.withjumpseat.com",
  }),
}));

import { clearJumpseatAuthorization } from "./oauth";

describe("clearJumpseatAuthorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getTokens.mockResolvedValue(undefined);
    mocks.getItem.mockResolvedValue(undefined);
    mocks.removeTokens.mockResolvedValue(undefined);
    mocks.removeItem.mockResolvedValue(undefined);
  });

  it("deletes local credentials even when revocation metadata cannot be read", async () => {
    mocks.getItem.mockRejectedValue(new Error("storage read failed"));

    await expect(clearJumpseatAuthorization()).resolves.toBeUndefined();

    expect(mocks.removeTokens).toHaveBeenCalledOnce();
    expect(mocks.removeItem).toHaveBeenCalledTimes(2);
  });

  it("reports a local token deletion failure after starting every cleanup", async () => {
    mocks.removeTokens.mockRejectedValue(new Error("token deletion failed"));

    await expect(clearJumpseatAuthorization()).rejects.toThrow(
      "token deletion failed",
    );

    expect(mocks.removeItem).toHaveBeenCalledTimes(2);
  });
});
