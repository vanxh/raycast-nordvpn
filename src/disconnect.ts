import { closeMainWindow } from "@raycast/api";
import { runNordvpn, withToast } from "./lib/nordvpn";

export default async function DisconnectCommand() {
  await closeMainWindow();
  await withToast(
    "Disconnecting…",
    async () => {
      await runNordvpn(["disconnect"]);
    },
    "Disconnected",
  );
}
