import { closeMainWindow } from "@raycast/api";
import {
  isNordvpnControllable,
  runNordvpn,
  showMissingCliToast,
  withToast,
} from "./lib/nordvpn";

export default async function DisconnectCommand() {
  await closeMainWindow();
  if (!isNordvpnControllable()) {
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
