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
  /** Preferences accessible in the `connect-fastest` command */
  export type ConnectFastest = ExtensionPreferences & {}
  /** Preferences accessible in the `connect-default-country` command */
  export type ConnectDefaultCountry = ExtensionPreferences & {}
  /** Preferences accessible in the `connect-p2p` command */
  export type ConnectP2P = ExtensionPreferences & {}
  /** Preferences accessible in the `connect-double-vpn` command */
  export type ConnectDoubleVpn = ExtensionPreferences & {}
  /** Preferences accessible in the `disconnect` command */
  export type Disconnect = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `connect` command */
  export type Connect = {}
  /** Arguments passed to the `connect-fastest` command */
  export type ConnectFastest = {}
  /** Arguments passed to the `connect-default-country` command */
  export type ConnectDefaultCountry = {}
  /** Arguments passed to the `connect-p2p` command */
  export type ConnectP2P = {}
  /** Arguments passed to the `connect-double-vpn` command */
  export type ConnectDoubleVpn = {}
  /** Arguments passed to the `disconnect` command */
  export type Disconnect = {}
}

