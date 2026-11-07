# Changelog

## [Dark Airline Logos] - {PR_MERGE_DATE}

- Use dark airline logos in dark appearance, in both the flight lists and the menu bar.
- Show an airplane icon in the menu bar flight items when an airline logo fails to load.
- Show the airline brand a flight flies under, such as a new name and logo after an announced rebrand, name it in the flight details and the menu bar, and find flights by either name.
- Show each flight number once under its airline code, such as LH 459, even when it is stored with the code attached, and keep a codeshare number under its own airline.
- Find flights by flight number, with or without the airline code: LH 459, LH459 or 459.

## [Initial Version] - 2026-09-25

- Add an upcoming-flights list and detail view.
- Add a friends' upcoming-flights view with friend, route, timing, status, airport, and aircraft details.
- Show route, flight number, departure countdown, gates, terminals, airports, seat, booking, and aircraft details.
- Add secure browser sign-in with authorization code and PKCE.
- Store and automatically refresh Raycast-scoped Jumpseat credentials.
- Call Jumpseat's authenticated upcoming-flights endpoint directly.
- Support Upcoming Flights on Windows while keeping the menu bar command exclusive to macOS.
