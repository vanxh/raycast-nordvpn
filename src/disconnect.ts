import { closeMainWindow, showToast, Toast } from "@raycast/api";
import {
  DISCONNECT_URL,
  fireDeepLink,
  isAppInstalled,
  NORDVPN_INSTALL_COMMAND,
} from "./lib/nordvpn";

export default async function DisconnectCommand() {
  await closeMainWindow();
  if (!isAppInstalled()) {
    await showToast({
      style: Toast.Style.Failure,
      title: "NordVPN app not found",
      message: `Install it with \`${NORDVPN_INSTALL_COMMAND}\`.`,
    });
    return;
  }
  await fireDeepLink(DISCONNECT_URL);
  await showToast({ style: Toast.Style.Success, title: "Sent to NordVPN" });
}
