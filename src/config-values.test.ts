import { describe, expect, test } from "vitest";
import { getJumpseatConfiguration } from "./config";
import {
  getProductionJumpseatConfiguration,
  isCompatibleJumpseatConfigurationId,
  isLegacyJumpseatConfigurationId,
  jumpseatConfigurationId,
} from "./config-values";

describe("Jumpseat endpoint configuration", () => {
  test("uses only the fixed production API, web, and OAuth origins", () => {
    const configuration = getJumpseatConfiguration();

    expect(configuration).toEqual({
      apiBaseUrl: "https://api.withjumpseat.com",
      webBaseUrl: "https://app.withjumpseat.com",
      authBaseUrl: "https://auth.withjumpseat.com",
    });
    expect(jumpseatConfigurationId(configuration)).toBe(
      "https://api.withjumpseat.com",
    );
  });

  test("keeps stored credentials when only the OAuth authority changes", () => {
    const configuration = getJumpseatConfiguration();

    expect(
      isCompatibleJumpseatConfigurationId(
        "https://api.withjumpseat.com\nhttps://app.withjumpseat.com",
        configuration,
      ),
    ).toBe(true);
    expect(
      isCompatibleJumpseatConfigurationId(
        "https://api.withjumpseat.com",
        configuration,
      ),
    ).toBe(true);
    expect(
      isCompatibleJumpseatConfigurationId(
        "https://other-api.example",
        configuration,
      ),
    ).toBe(false);
    expect(
      isLegacyJumpseatConfigurationId(
        "https://api.withjumpseat.com\nhttps://app.withjumpseat.com",
      ),
    ).toBe(true);
  });

  test("permits a deployment-controlled OAuth authority override", () => {
    expect(
      getProductionJumpseatConfiguration({
        JUMPSEAT_AUTH_ORIGIN: "https://auth-staging.withjumpseat.com/",
      }).authBaseUrl,
    ).toBe("https://auth-staging.withjumpseat.com");
  });
});
