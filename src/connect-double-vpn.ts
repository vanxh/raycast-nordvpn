import { buildConnectUrl } from "./lib/nordvpn";
import { runDeepLinkCommand } from "./lib/run-command";

export default async function ConnectDoubleVpnCommand() {
  await runDeepLinkCommand(
    buildConnectUrl({ mode: "group", group: "double_vpn" }),
    "Sent to NordVPN",
  );
}
