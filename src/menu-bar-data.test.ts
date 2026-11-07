import { describe, expect, it, vi } from "vitest";
import { flightAirline } from "./airline-brand";
import type { AirlineBrandSummary, UpcomingFlight } from "./api-response";
const mocks = vi.hoisted(() => ({ fetch: vi.fn() }));
vi.mock("./api", () => ({ fetchUpcomingFlights: mocks.fetch }));
import { fetchMenuBarFlights } from "./menu-bar-data";

describe("cached menu-bar fetch", () => {
  it("redacts the response before the promise resolves for caching", async () => {
    mocks.fetch.mockResolvedValue([
      {
        flight: {
          id: "flight",
          departureTime: "2026-09-15T12:00:00Z",
          secret: "PRIVATE-FLIGHT",
        },
        airline: { iata: "EI", secret: "PRIVATE-AIRLINE" },
        departureAirport: { iata: "DUB", secret: "PRIVATE-AIRPORT" },
        arrivalAirport: null,
        bookingNumber: "PRIVATE-BOOKING",
        seatNumber: "PRIVATE-SEAT",
        seatCabinClass: "PRIVATE-CABIN",
        seatPosition: "PRIVATE-POSITION",
      },
    ]);
    const result = await fetchMenuBarFlights();
    expect(result[0].flight.id).toBe("flight");
    expect(JSON.stringify(result)).not.toContain("PRIVATE-");
  });

  it("keeps a flight's brand across refreshes that omit it until the brand is current", async () => {
    const response = (airlineBrand?: AirlineBrandSummary): UpcomingFlight[] => [
      {
        flight: {
          id: "flight",
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
          ...(airlineBrand ? { airlineBrand } : {}),
        },
        airline: {
          iata: "TW",
          name: "T'way Air",
          logoUrl: "https://cdn.withjumpseat.com/airline-logos/TWB/light.svg",
          logoDarkUrl: null,
        },
        departureAirport: {
          iata: "ICN",
          icao: "RKSI",
          name: "Incheon International Airport",
          city: "Seoul",
          country: "South Korea",
          timeZoneRegionName: "Asia/Seoul",
        },
        arrivalAirport: null,
        bookingNumber: null,
        seatNumber: null,
        seatCabinClass: null,
        seatPosition: null,
      },
    ];
    const scheduled: AirlineBrandSummary = {
      kind: "scheduled",
      name: "Trinity Airways",
      logoUrl: "https://cdn.withjumpseat.com/airline-logos/TW1/light.svg",
      logoDarkUrl: null,
    };
    const shown = (
      flights: Awaited<ReturnType<typeof fetchMenuBarFlights>>,
    ) => {
      const airline = flightAirline(flights[0]);
      return [airline.name, airline.logoUrl];
    };

    mocks.fetch.mockResolvedValueOnce(response(scheduled));
    const branded = await fetchMenuBarFlights(undefined);
    expect(shown(branded)).toEqual(["Trinity Airways", scheduled.logoUrl]);

    mocks.fetch.mockResolvedValueOnce(response());
    const omitted = await fetchMenuBarFlights(
      JSON.parse(JSON.stringify(branded)),
    );
    expect(shown(omitted)).toEqual(["Trinity Airways", scheduled.logoUrl]);

    mocks.fetch.mockResolvedValueOnce(
      response({
        kind: "current",
        name: null,
        logoUrl: null,
        logoDarkUrl: null,
      }),
    );
    const current = await fetchMenuBarFlights(omitted);
    expect(shown(current)).toEqual([
      "T'way Air",
      "https://cdn.withjumpseat.com/airline-logos/TWB/light.svg",
    ]);

    mocks.fetch.mockResolvedValueOnce(response());
    expect(shown(await fetchMenuBarFlights(current))).toEqual([
      "T'way Air",
      "https://cdn.withjumpseat.com/airline-logos/TWB/light.svg",
    ]);
  });
});
