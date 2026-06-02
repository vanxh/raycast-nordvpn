/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Default Location - Optional default location for quick connect, e.g. United_States, Germany, London */
  "defaultLocation"?: string,
  /** NordVPN CLI Path - Path to nordvpn command if not in PATH */
  "nordvpnPath": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `connect` command */
  export type Connect = ExtensionPreferences & {}
  /** Preferences accessible in the `disconnect` command */
  export type Disconnect = ExtensionPreferences & {}
  /** Preferences accessible in the `status` command */
  export type Status = ExtensionPreferences & {}
  /** Preferences accessible in the `quick-actions` command */
  export type QuickActions = ExtensionPreferences & {}
  /** Preferences accessible in the `settings` command */
  export type Settings = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `connect` command */
  export type Connect = {}
  /** Arguments passed to the `disconnect` command */
  export type Disconnect = {}
  /** Arguments passed to the `status` command */
  export type Status = {}
  /** Arguments passed to the `quick-actions` command */
  export type QuickActions = {}
  /** Arguments passed to the `settings` command */
  export type Settings = {}
}

