/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Default Country - Optional 2-letter ISO country code for quick connect, e.g. us, de, jp */
  "defaultCountry"?: string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `connect` command */
  export type Connect = ExtensionPreferences & {}
  /** Preferences accessible in the `disconnect` command */
  export type Disconnect = ExtensionPreferences & {}
  /** Preferences accessible in the `login` command */
  export type Login = ExtensionPreferences & {}
  /** Preferences accessible in the `quick-actions` command */
  export type QuickActions = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `connect` command */
  export type Connect = {}
  /** Arguments passed to the `disconnect` command */
  export type Disconnect = {}
  /** Arguments passed to the `login` command */
  export type Login = {}
  /** Arguments passed to the `quick-actions` command */
  export type QuickActions = {}
}

