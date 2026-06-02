import { closeMainWindow, showToast, Toast } from "@raycast/api";
import {
  fireDeepLink,
  isAppInstalled,
  NORDVPN_INSTALL_COMMAND,
} from "./nordvpn";

/**
 * Shared body for the no-view deep-link commands. Closes the Raycast window,
 * checks the app is installed, fires the deep link, and reports via toast.
 * Deep links are fire-and-forget, so success means "handed to the app".
 */
export async function runDeepLinkCommand(
  url: string,
  successTitle: string,
): Promise<void> {
  await closeMainWindow();
  if (!isAppInstalled()) {
    await showToast({
      style: Toast.Style.Failure,
      title: "NordVPN app not found",
      message: `Install it with \`${NORDVPN_INSTALL_COMMAND}\`.`,
    });
    return;
  }
  try {
    await fireDeepLink(url);
    await showToast({ style: Toast.Style.Success, title: successTitle });
  } catch (err) {
    await showToast({
      style: Toast.Style.Failure,
      title: "NordVPN action failed",
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
