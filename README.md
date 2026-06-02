# NordVPN for Raycast

Control [NordVPN](https://nordvpn.com) from Raycast using the official `nordvpn` CLI.

## Commands

- **Connect** — Connect to the fastest server, a specific country/city/server, or a specialty group (P2P, Double VPN, Onion Over VPN, Dedicated IP).
- **Disconnect** — Disconnect immediately (no-view).
- **Status** — Show current connection state, IP, country, technology, transfer, uptime.
- **Quick Actions** — One-shot list for fastest connect, default location, specialty groups, reconnect, disconnect.
- **Settings** — Toggle Kill Switch, Auto-connect, Threat Protection Lite, Meshnet, Obfuscation, Notifications, IPv6, Routing, Analytics, LAN Discovery, Virtual Location.

## Requirements

This extension shells out to the NordVPN CLI. You must install and log in **before** using it:

1. Install the CLI: <https://nordvpn.com/download/>
2. Start the daemon (Linux: `sudo systemctl start nordvpnd`; macOS: launches automatically after install).
3. Log in: `nordvpn login` (follow the printed browser URL).
4. Verify: `nordvpn status` works in a normal terminal.

If the binary is not in `PATH`, set its full path in the extension preferences (`NordVPN CLI Path`).

## Preferences

| Preference | Description |
|---|---|
| `Default Location` | Optional. Used by **Quick Actions → Connect Default Location**. Use NordVPN's format, e.g. `United_States`, `Germany`, `London`, `us1234`. Spaces are converted to underscores. |
| `NordVPN CLI Path` | Path to `nordvpn` if not on `PATH`. Defaults to `/usr/local/bin/nordvpn`, falls back to common Homebrew / Linux paths. |

## Install (from source)

```sh
git clone <this-repo>
cd raycast-nordvpn
npm install
npm run dev    # opens the extension in Raycast dev mode
```

## Develop

```sh
npm run dev        # ray develop — hot reload
npm run lint       # ray lint
npm run fix-lint   # ray lint --fix
npm run build      # ray build -e dist
```

## How it works

- Commands are executed via `child_process.execFile` with an argument allowlist (`^[A-Za-z0-9_.,:/\-+@]+$`) — no shell, no interpolation.
- Output is stripped of ANSI codes and CLI spinner glyphs before parsing.
- Status / Settings are parsed as `Key: Value` pairs from the CLI's stdout.
- Errors are mapped to human messages (not logged in, daemon down, CLI missing, permission denied).
- No credentials are touched; login lives entirely inside the CLI.

## Notes

- The icon file `assets/command-icon.png` is a placeholder. Replace it with a 512×512 PNG for publishing to the Raycast Store.
- NordVPN's CLI output format may change between releases; field parsing is defensive but new fields will simply appear as raw rows in **Status** / **Settings**.

## License

MIT
