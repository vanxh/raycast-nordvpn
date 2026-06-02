import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { existsSync } from "node:fs";
import { getPreferenceValues, open, showToast, Toast } from "@raycast/api";

const execFileP = promisify(execFile);

const URL_RE = /https?:\/\/[^\s'")]+/;

export interface Preferences {
  defaultLocation?: string;
  nordvpnPath?: string;
}

const FALLBACK_PATHS = [
  "/usr/local/bin/nordvpn",
  "/opt/homebrew/bin/nordvpn",
  "/opt/nordvpn/bin/nordvpn",
  "/usr/bin/nordvpn",
];

const BREW_PATHS = ["/opt/homebrew/bin/brew", "/usr/local/bin/brew"];

export const NORDVPN_DOWNLOAD_URL = "https://nordvpn.com/download/";
export const HOMEBREW_URL = "https://brew.sh";
export const NORDVPN_INSTALL_COMMAND = "brew install --cask nordvpn";
export const NORDVPN_LOGIN_COMMAND = "nordvpn login";

export function findNordvpnBinary(): string | null {
  const prefs = getPreferenceValues<Preferences>();
  const candidate = (prefs.nordvpnPath || "").trim();
  if (candidate && existsSync(candidate)) return candidate;
  for (const p of FALLBACK_PATHS) {
    if (existsSync(p)) return p;
  }
  return null;
}

export function findBrewBinary(): string | null {
  for (const p of BREW_PATHS) {
    if (existsSync(p)) return p;
  }
  return null;
}

export function getNordvpnPath(): string {
  return findNordvpnBinary() ?? "nordvpn";
}

export async function installNordvpnViaBrew(): Promise<void> {
  const brew = findBrewBinary();
  if (!brew) {
    throw new NordvpnError(
      "Homebrew not found. Install Homebrew first from https://brew.sh.",
    );
  }
  await execFileP(brew, ["install", "--cask", "nordvpn"], {
    timeout: 5 * 60_000,
    maxBuffer: 8 * 1024 * 1024,
    env: {
      ...process.env,
      PATH: `${process.env.PATH || ""}:/usr/local/bin:/opt/homebrew/bin:/usr/bin`,
    },
  });
}

export async function openBrewInstallInTerminal(): Promise<void> {
  const brew = findBrewBinary();
  if (!brew) {
    throw new NordvpnError(
      "Homebrew not found. Install Homebrew first from https://brew.sh.",
    );
  }
  const command = `${brew} install --cask nordvpn; echo; echo 'NordVPN install finished. You can close this window, then run the Raycast Log in command.'`;
  await execFileP("/usr/bin/osascript", [
    "-e",
    `tell application "Terminal" to activate`,
    "-e",
    `tell application "Terminal" to do script ${JSON.stringify(command)}`,
  ]);
}

export async function showMissingCliToast(): Promise<void> {
  const brew = findBrewBinary();
  await showToast({
    style: Toast.Style.Failure,
    title: "NordVPN CLI not found",
    message: brew
      ? `Run \`${NORDVPN_INSTALL_COMMAND}\` or open the download page.`
      : "Install from nordvpn.com/download.",
    primaryAction: {
      title: "Open Download Page",
      onAction: () => {
        open(NORDVPN_DOWNLOAD_URL);
      },
    },
  });
}

export class NordvpnError extends Error {
  constructor(
    message: string,
    public readonly stderr?: string,
  ) {
    super(message);
    this.name = "NordvpnError";
  }
}

const ARG_PATTERN = /^[A-Za-z0-9_.,:/\-+@]+$/;

function validateArg(arg: string): void {
  if (!ARG_PATTERN.test(arg)) {
    throw new NordvpnError(`Invalid argument: "${arg}"`);
  }
}

export interface RunOptions {
  timeoutMs?: number;
}

export async function runNordvpn(
  args: string[],
  opts: RunOptions = {},
): Promise<string> {
  for (const a of args) validateArg(a);
  const bin = findNordvpnBinary();
  if (!bin) {
    throw new NordvpnError(
      `NordVPN CLI not found. Install with \`${NORDVPN_INSTALL_COMMAND}\` or from ${NORDVPN_DOWNLOAD_URL}, then run \`${NORDVPN_LOGIN_COMMAND}\`.`,
    );
  }
  try {
    const { stdout, stderr } = await execFileP(bin, args, {
      timeout: opts.timeoutMs ?? 30_000,
      maxBuffer: 4 * 1024 * 1024,
      env: {
        ...process.env,
        PATH: `${process.env.PATH || ""}:/usr/local/bin:/opt/homebrew/bin:/usr/bin`,
      },
    });
    return cleanOutput(stdout || stderr || "");
  } catch (err: unknown) {
    throw mapError(err);
  }
}

function mapError(err: unknown): NordvpnError {
  const e = err as {
    code?: string | number;
    stderr?: string;
    stdout?: string;
    message?: string;
  };
  const raw = cleanOutput(e.stderr || e.stdout || "");
  const msg = raw || e.message || "Unknown error";
  if (e.code === "ENOENT") {
    return new NordvpnError(
      `NordVPN CLI not found. Install with \`${NORDVPN_INSTALL_COMMAND}\` or from ${NORDVPN_DOWNLOAD_URL}, then run \`${NORDVPN_LOGIN_COMMAND}\`.`,
    );
  }
  if (/not logged in/i.test(msg)) {
    return new NordvpnError(
      "Not logged in. Run `nordvpn login` in a terminal first.",
      raw,
    );
  }
  if (/daemon/i.test(msg) && /(not running|connect)/i.test(msg)) {
    return new NordvpnError(
      "NordVPN daemon is not running. Start it and try again.",
      raw,
    );
  }
  if (/permission denied/i.test(msg)) {
    return new NordvpnError(
      "Permission denied running nordvpn. Check the CLI install.",
      raw,
    );
  }
  return new NordvpnError(msg.split("\n")[0] || "NordVPN command failed", raw);
}

// eslint-disable-next-line no-control-regex
const ANSI_RE = /\x1B\[[0-?]*[ -/]*[@-~]/g;
const SPINNER_RE = /[⠁⠂⠄⡀⢀⠠⠐⠈⠉⠙⠹⠸⠼⠴⠦⠧⠇⠏\\\-/|]/g;

export function cleanOutput(s: string): string {
  return s
    .replace(ANSI_RE, "")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.replace(SPINNER_RE, "").trim())
    .filter((line) => line.length > 0 && !/^-+$/.test(line))
    .join("\n");
}

export interface Status {
  connected: boolean;
  raw: string;
  fields: Record<string, string>;
}

export function parseStatus(output: string): Status {
  const fields: Record<string, string> = {};
  for (const line of output.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (key && value) fields[key] = value;
  }
  const statusField = (fields["status"] || "").toLowerCase();
  return {
    connected:
      statusField.includes("connected") &&
      !statusField.includes("disconnected"),
    raw: output,
    fields,
  };
}

export async function getStatus(): Promise<Status> {
  const out = await runNordvpn(["status"]);
  return parseStatus(out);
}

export interface SettingsState {
  raw: string;
  fields: Record<string, string>;
}

export function parseSettings(output: string): SettingsState {
  const fields: Record<string, string> = {};
  for (const line of output.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (key && value) fields[key] = value;
  }
  return { raw: output, fields };
}

export function isOn(value: string | undefined): boolean {
  if (!value) return false;
  return /^(enabled|on|true|yes)/i.test(value.trim());
}

export async function getSettings(): Promise<SettingsState> {
  const out = await runNordvpn(["settings"]);
  return parseSettings(out);
}

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

export function sanitizeLocation(input: string): string {
  return input.trim().replace(/\s+/g, "_");
}

export interface LoginResult {
  url?: string;
  alreadyLoggedIn: boolean;
  output: string;
}

export async function loginNordvpn(
  opts: { timeoutMs?: number } = {},
): Promise<LoginResult> {
  const bin = findNordvpnBinary();
  if (!bin) {
    throw new NordvpnError(
      `NordVPN CLI not found. Install with \`${NORDVPN_INSTALL_COMMAND}\` or from ${NORDVPN_DOWNLOAD_URL}.`,
    );
  }
  const timeoutMs = opts.timeoutMs ?? 30_000;
  return new Promise<LoginResult>((resolve, reject) => {
    const child = spawn(bin, ["login"], {
      env: {
        ...process.env,
        PATH: `${process.env.PATH || ""}:/usr/local/bin:/opt/homebrew/bin:/usr/bin`,
      },
    });
    let buf = "";
    let settled = false;
    const finish = (action: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      action();
    };
    const checkBuffer = () => {
      const clean = cleanOutput(buf);
      const m = clean.match(URL_RE);
      if (m) {
        const url = m[0];
        finish(() => {
          child.unref();
          resolve({ url, alreadyLoggedIn: false, output: clean });
        });
        return;
      }
      if (/already logged ?in/i.test(clean)) {
        finish(() => {
          try {
            child.kill("SIGTERM");
          } catch {
            // ignore
          }
          resolve({ alreadyLoggedIn: true, output: clean });
        });
      }
    };
    const onData = (d: Buffer) => {
      buf += d.toString();
      checkBuffer();
    };
    child.stdout?.on("data", onData);
    child.stderr?.on("data", onData);
    child.on("error", (e: NodeJS.ErrnoException) => {
      finish(() => {
        if (e.code === "ENOENT") {
          reject(
            new NordvpnError(
              `NordVPN CLI not found. Install with \`${NORDVPN_INSTALL_COMMAND}\`.`,
            ),
          );
        } else {
          reject(new NordvpnError(e.message || "Failed to start nordvpn"));
        }
      });
    });
    child.on("exit", (code) => {
      finish(() => {
        const clean = cleanOutput(buf);
        if (code === 0) {
          resolve({
            alreadyLoggedIn: /already logged ?in|welcome/i.test(clean),
            output: clean,
          });
        } else {
          reject(
            new NordvpnError(
              clean.split("\n").pop() ||
                `nordvpn login exited with code ${code ?? "null"}`,
              clean,
            ),
          );
        }
      });
    });
    const timer = setTimeout(() => {
      finish(() => {
        try {
          child.kill("SIGTERM");
        } catch {
          // ignore
        }
        const clean = cleanOutput(buf);
        const m = clean.match(URL_RE);
        if (m) {
          resolve({ url: m[0], alreadyLoggedIn: false, output: clean });
        } else {
          reject(
            new NordvpnError(
              `Login timed out after ${Math.round(timeoutMs / 1000)}s. Try \`${NORDVPN_LOGIN_COMMAND}\` in a terminal.`,
              clean,
            ),
          );
        }
      });
    }, timeoutMs);
  });
}
