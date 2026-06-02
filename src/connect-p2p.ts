import { buildConnectUrl } from "./lib/nordvpn";
import { runDeepLinkCommand } from "./lib/run-command";

export default async function ConnectP2PCommand() {
  await runDeepLinkCommand(
    buildConnectUrl({ mode: "group", group: "p2p" }),
    "Sent to NordVPN",
  );
}
