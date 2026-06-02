import { existsSync } from "node:fs";
import { open, showToast, Toast } from "@raycast/api";

export const NORDVPN_APP_PATH = "/Applications/NordVPN.app";
export const NORDVPN_DOWNLOAD_URL = "https://nordvpn.com/download/";
export const HOMEBREW_URL = "https://brew.sh";
export const NORDVPN_INSTALL_COMMAND = "brew install --cask nordvpn";

export interface Preferences {
  /** Default 2-letter ISO country code for quick connect, e.g. us, de, jp. */
  defaultCountry?: string;
}

export function isAppInstalled(): boolean {
  return existsSync(NORDVPN_APP_PATH);
}

const ISO2_RE = /^[a-z]{2}$/;
const GROUP_RE = /^[a-z0-9_]+$/;

export function sanitizeCountry(input: string): string {
  return input.trim().toLowerCase();
}

export interface ConnectTarget {
  mode: "fastest" | "country" | "group";
  /** 2-letter ISO country code (only used when mode === "country"). */
  country?: string;
  /** Specialty group identifier (only used when mode === "group"). */
  group?: string;
}

/**
 * Build a NordVPN deep link. The macOS app has no CLI and no AppleScript, so
 * the `nordvpn://` URL scheme is the only automation surface.
 *
 * Verified behaviour:
 *  - `nordvpn://connect`                  -> fastest
 *  - `nordvpn://connect?country=<iso2>`   -> country (2-letter ISO code ONLY)
 *  - `nordvpn://connect?group=<name>`     -> specialty group (e.g. p2p)
 *  - `nordvpn://disconnect`               -> disconnect
 */
export function buildConnectUrl(target: ConnectTarget): string {
  if (target.mode === "country" && target.country) {
    const code = sanitizeCountry(target.country);
    if (!ISO2_RE.test(code)) {
      throw new Error(
        `Country must be a 2-letter ISO code (e.g. us, de, jp), got "${target.country}".`,
      );
    }
    return `nordvpn://connect?country=${code}`;
  }
  if (target.mode === "group" && target.group) {
    const group = target.group.trim().toLowerCase();
    if (!GROUP_RE.test(group)) {
      throw new Error(`Invalid group "${target.group}".`);
    }
    return `nordvpn://connect?group=${group}`;
  }
  return "nordvpn://connect";
}

export const DISCONNECT_URL = "nordvpn://disconnect";
export const LOGIN_URL = "nordvpn://login";

/**
 * Hand a `nordvpn://` deep link to the NordVPN app. Fire-and-forget: the app
 * performs the action, but there is no way to read the result back.
 */
export async function fireDeepLink(url: string): Promise<void> {
  if (!isAppInstalled()) {
    throw new Error(
      `NordVPN app not found at ${NORDVPN_APP_PATH}. Install it with \`${NORDVPN_INSTALL_COMMAND}\` or from ${NORDVPN_DOWNLOAD_URL}.`,
    );
  }
  await open(url);
}

export async function openApp(): Promise<void> {
  await open(NORDVPN_APP_PATH);
}

/**
 * Run an async action behind an animated toast that resolves to success or
 * failure. Because deep links are fire-and-forget, "success" means the request
 * was handed to the app, not that the VPN state actually changed.
 */
export async function withToast<T>(
  title: string,
  fn: () => Promise<T>,
  successTitle?: string,
): Promise<T | undefined> {
  const toast = await showToast({ style: Toast.Style.Animated, title });
  try {
    const result = await fn();
    toast.style = Toast.Style.Success;
    toast.title = successTitle ?? title;
    return result;
  } catch (err) {
    toast.style = Toast.Style.Failure;
    toast.title = title.endsWith("…") ? title.slice(0, -1) : title;
    toast.message = err instanceof Error ? err.message : String(err);
    return undefined;
  }
}

/** Common NordVPN countries with their 2-letter ISO codes, for dropdowns. */
export const COUNTRIES: Array<{ code: string; name: string }> = [
  { code: "us", name: "United States" },
  { code: "gb", name: "United Kingdom" },
  { code: "ca", name: "Canada" },
  { code: "au", name: "Australia" },
  { code: "de", name: "Germany" },
  { code: "fr", name: "France" },
  { code: "nl", name: "Netherlands" },
  { code: "ch", name: "Switzerland" },
  { code: "se", name: "Sweden" },
  { code: "no", name: "Norway" },
  { code: "es", name: "Spain" },
  { code: "it", name: "Italy" },
  { code: "ie", name: "Ireland" },
  { code: "jp", name: "Japan" },
  { code: "sg", name: "Singapore" },
  { code: "hk", name: "Hong Kong" },
  { code: "in", name: "India" },
  { code: "br", name: "Brazil" },
  { code: "ae", name: "United Arab Emirates" },
  { code: "za", name: "South Africa" },
];

/** Specialty groups exposed via the deep-link `group=` param. */
export const GROUPS: Array<{ id: string; title: string }> = [
  { id: "p2p", title: "P2P" },
  { id: "double_vpn", title: "Double VPN" },
  { id: "onion_over_vpn", title: "Onion Over VPN" },
  { id: "dedicated_ip", title: "Dedicated IP" },
  { id: "standard_vpn_servers", title: "Standard VPN Servers" },
];
