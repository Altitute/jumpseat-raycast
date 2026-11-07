import { describe, expect, it } from "vitest";
import { flightAirline, flightAirlineKeywords } from "./airline-brand";
import type { AirlineBrandSummary, UpcomingFlight } from "./api-response";
import { trustedAirlineLogoSource } from "./assets";

const airline = {
  iata: "TW",
  name: "T'way Air",
  logoUrl: "https://cdn.withjumpseat.com/airline-logos/TWB/light.svg",
  logoDarkUrl: "https://cdn.withjumpseat.com/airline-logos/TWB/dark.svg",
};

function flight(
  airlineBrand?: AirlineBrandSummary,
): Pick<UpcomingFlight, "flight" | "airline"> {
  return {
    flight: {
      id: "11111111-1111-4111-8111-111111111111",
      flightNumber: "201",
      departureTime: "2026-09-20T01:00:00.000Z",
      arrivalTime: "2026-09-20T03:00:00.000Z",
      estimatedDepartureTime: null,
      estimatedArrivalTime: null,
      departureGate: null,
      arrivalGate: null,
      departureTerminal: null,
      arrivalTerminal: null,
      aircraftName: null,
      aircraftRegistration: null,
      aircraftShipName: null,
      flightState: "scheduled",
      boardState: null,
      flightPhase: null,
      onTimeStatus: null,
      airlineBrand,
    },
    airline,
  };
}

const scheduled: AirlineBrandSummary = {
  kind: "scheduled",
  name: "Trinity Airways",
  logoUrl: "https://cdn.withjumpseat.com/airline-logos/TW1/light.svg",
  logoDarkUrl: "https://cdn.withjumpseat.com/airline-logos/TW1/dark.svg",
};

describe("flight airline brand", () => {
  it("keeps the airline when the brand is absent, current or unknown", () => {
    expect(flightAirline(flight())).toBe(airline);
    const current = {
      kind: "current",
      name: null,
      logoUrl: null,
      logoDarkUrl: null,
    };
    expect(flightAirline(flight(current))).toBe(airline);
    expect(flightAirline(flight({ ...scheduled, kind: "future" }))).toBe(
      airline,
    );
  });

  it("uses a scheduled or past brand's name and logo", () => {
    expect(flightAirline(flight(scheduled))).toEqual({
      iata: "TW",
      name: "Trinity Airways",
      logoUrl: scheduled.logoUrl,
      logoDarkUrl: scheduled.logoDarkUrl,
    });
    expect(flightAirline(flight({ ...scheduled, kind: "past" })).name).toBe(
      "Trinity Airways",
    );
  });

  it("never falls back to the airline's current logo", () => {
    const withoutLogo = { ...scheduled, logoUrl: null, logoDarkUrl: null };
    expect(
      trustedAirlineLogoSource(flightAirline(flight(withoutLogo))),
    ).toBeUndefined();
  });

  it("keeps the airline name when the brand has none", () => {
    expect(flightAirline(flight({ ...scheduled, name: " " })).name).toBe(
      "T'way Air",
    );
  });

  it("makes the flight searchable by both the brand and the airline name", () => {
    expect(flightAirlineKeywords(flight(scheduled))).toEqual([
      "Trinity Airways",
      "T'way Air",
    ]);
    expect(flightAirlineKeywords(flight())).toEqual(["T'way Air"]);
  });
});
