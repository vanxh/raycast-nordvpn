import { buildConnectUrl } from "./lib/nordvpn";
import { runDeepLinkCommand } from "./lib/run-command";

export default async function ConnectFastestCommand() {
  await runDeepLinkCommand(
    buildConnectUrl({ mode: "fastest" }),
    "Sent to NordVPN",
  );
}
