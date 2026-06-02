import { Action, ActionPanel, Detail, Icon } from "@raycast/api";
import { LOGIN_URL, fireDeepLink, openApp, withToast } from "./lib/nordvpn";
import { MissingAppView, useAppInstalled } from "./lib/missing-app";

const MARKDOWN = [
  "# Log in to NordVPN",
  "",
  "macOS NordVPN has no CLI, so login happens in the app itself.",
  "Use the action below to open NordVPN (or jump straight to its login screen),",
  "then sign in there. Once logged in, use **Connect**, **Disconnect**, and **Quick Actions**.",
  "",
  "No credentials are read or stored by this extension.",
].join("\n");

export default function LoginCommand() {
  const app = useAppInstalled();

  if (!app.installed && !app.isLoading) {
    return <MissingAppView onRecheck={app.revalidate} />;
  }

  return (
    <Detail
      isLoading={app.isLoading}
      markdown={MARKDOWN}
      actions={
        <ActionPanel>
          <Action
            title="Open Login Screen"
            icon={Icon.Lock}
            onAction={() =>
              withToast(
                "Opening NordVPN login…",
                () => fireDeepLink(LOGIN_URL),
                "Opened NordVPN",
              )
            }
          />
          <Action
            title="Open NordVPN App"
            icon={Icon.AppWindow}
            onAction={openApp}
          />
        </ActionPanel>
      }
    />
  );
}
