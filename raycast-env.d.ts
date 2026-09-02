/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `upcoming-flights` command */
  export type UpcomingFlights = ExtensionPreferences & {}
  /** Preferences accessible in the `friends-upcoming-flights` command */
  export type FriendsUpcomingFlights = ExtensionPreferences & {}
  /** Preferences accessible in the `next-flight-in-menu-bar` command */
  export type NextFlightInMenuBar = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `upcoming-flights` command */
  export type UpcomingFlights = {}
  /** Arguments passed to the `friends-upcoming-flights` command */
  export type FriendsUpcomingFlights = {}
  /** Arguments passed to the `next-flight-in-menu-bar` command */
  export type NextFlightInMenuBar = {}
}

