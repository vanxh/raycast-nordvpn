import { closeMainWindow } from "@raycast/api";
import {
  findNordvpnBinary,
  runNordvpn,
  showMissingCliToast,
  withToast,
} from "./lib/nordvpn";

export default async function DisconnectCommand() {
  await closeMainWindow();
  if (!findNordvpnBinary()) {
    await showMissingCliToast();
    return;
  }
  await withToast(
    "Disconnecting…",
    async () => {
      await runNordvpn(["disconnect"]);
    },
    "Disconnected",
  );
}
