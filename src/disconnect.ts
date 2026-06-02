import { DISCONNECT_URL } from "./lib/nordvpn";
import { runDeepLinkCommand } from "./lib/run-command";

export default async function DisconnectCommand() {
  await runDeepLinkCommand(DISCONNECT_URL, "Sent to NordVPN");
}
