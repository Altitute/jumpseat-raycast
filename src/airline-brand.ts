import type { AirlineSummary, UpcomingFlight } from "./api-response";

// A past or scheduled brand replaces the airline's name and logo. A brand
// without a logo yields null logos (the fallback icon), never the airline's
// current logo. The current brand, an unknown kind or an absent field keep the
// airline as it is.
export function flightAirline(
  flight: Pick<UpcomingFlight, "flight" | "airline">,
): AirlineSummary {
  const brand = flight.flight.airlineBrand;
  if (!brand || (brand.kind !== "past" && brand.kind !== "scheduled")) {
    return flight.airline;
  }
  return {
    iata: flight.airline.iata,
    name: brand.name?.trim() || flight.airline.name,
    logoUrl: brand.logoUrl,
    logoDarkUrl: brand.logoDarkUrl,
  };
}

export function flightAirlineKeywords(
  flight: Pick<UpcomingFlight, "flight" | "airline">,
): string[] {
  const names = [flightAirline(flight).name, flight.airline.name];
  return [...new Set(names)];
}
