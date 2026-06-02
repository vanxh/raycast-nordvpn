import { getPreferenceValues, showToast, Toast } from "@raycast/api";
import {
  buildConnectUrl,
  sanitizeCountry,
  type Preferences,
} from "./lib/nordvpn";
import { runDeepLinkCommand } from "./lib/run-command";

export default async function ConnectDefaultCountryCommand() {
  const prefs = getPreferenceValues<Preferences>();
  const country = sanitizeCountry(prefs.defaultCountry ?? "");
  if (!country) {
    await showToast({
      style: Toast.Style.Failure,
      title: "No default country set",
      message: "Set a 2-letter ISO code (e.g. us) in extension preferences.",
    });
    return;
  }
  try {
    const url = buildConnectUrl({ mode: "country", country });
    await runDeepLinkCommand(url, `Connecting to ${country.toUpperCase()}`);
  } catch (err) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Invalid default country",
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
