export interface JumpseatConfiguration {
  apiBaseUrl: string;
  webBaseUrl: string;
  authBaseUrl: string;
}

const PRODUCTION_API_URL = "https://api.withjumpseat.com";
const PRODUCTION_WEB_URL = "https://app.withjumpseat.com";
const PRODUCTION_AUTH_URL = "https://auth.withjumpseat.com";

type ConfigurationEnvironment = Record<string, string | undefined>;

function configuredAuthUrl(env: ConfigurationEnvironment): string {
  const configured = env.JUMPSEAT_AUTH_ORIGIN?.trim();
  return configured?.replace(/\/+$/g, "") || PRODUCTION_AUTH_URL;
}

export function getProductionJumpseatConfiguration(
  env: ConfigurationEnvironment = process.env,
): JumpseatConfiguration {
  return {
    apiBaseUrl: PRODUCTION_API_URL,
    webBaseUrl: PRODUCTION_WEB_URL,
    authBaseUrl: configuredAuthUrl(env),
  };
}

export function jumpseatConfigurationId(
  configuration: JumpseatConfiguration,
): string {
  // OAuth credentials are issued for the API resource. The authorization
  // authority can move independently, so it must not invalidate a healthy
  // stored Raycast session during an auth-host migration.
  return configuration.apiBaseUrl;
}

export function isCompatibleJumpseatConfigurationId(
  storedConfigurationId: string | undefined,
  configuration: JumpseatConfiguration,
): boolean {
  if (storedConfigurationId === jumpseatConfigurationId(configuration)) {
    return true;
  }

  return isLegacyJumpseatConfigurationId(storedConfigurationId);
}

export function isLegacyJumpseatConfigurationId(
  storedConfigurationId: string | undefined,
): boolean {
  // Released versions fingerprinted both fixed production origins. Accept
  // precisely that value, but retain its protocol marker and authority.
  return (
    storedConfigurationId === `${PRODUCTION_API_URL}\n${PRODUCTION_WEB_URL}`
  );
}

export function legacyJumpseatConfigurationId(): string {
  return `${PRODUCTION_API_URL}\n${PRODUCTION_WEB_URL}`;
}
