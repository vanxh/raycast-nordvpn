import {
  Action,
  ActionPanel,
  Icon,
  launchCommand,
  LaunchType,
  List,
  showToast,
  Toast,
} from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import {
  findBrewBinary,
  findNordvpnBinary,
  HOMEBREW_URL,
  NORDVPN_DOWNLOAD_URL,
  NORDVPN_INSTALL_COMMAND,
  NORDVPN_LOGIN_COMMAND,
  openBrewInstallInTerminal,
} from "./nordvpn";

export function MissingCliView({ onRecheck }: { onRecheck?: () => void }) {
  const brew = findBrewBinary();

  const description = brew
    ? `Install the NordVPN CLI to use this extension. Recommended: run \`${NORDVPN_INSTALL_COMMAND}\` (Homebrew detected). After installing, run \`${NORDVPN_LOGIN_COMMAND}\` in a terminal to sign in.`
    : `Install the NordVPN CLI to use this extension. Download from nordvpn.com or install Homebrew first to use \`${NORDVPN_INSTALL_COMMAND}\`. After installing, run \`${NORDVPN_LOGIN_COMMAND}\` in a terminal to sign in.`;

  return (
    <List>
      <List.EmptyView
        icon={{ source: Icon.ExclamationMark }}
        title="NordVPN CLI Not Found"
        description={description}
        actions={
          <ActionPanel>
            {brew && (
              <Action
                title="Install Via Homebrew in Terminal"
                icon={Icon.Terminal}
                onAction={async () => {
                  const toast = await showToast({
                    style: Toast.Style.Animated,
                    title: "Opening Terminal…",
                    message:
                      "Run the Homebrew installer there so you can see prompts/output.",
                  });
                  try {
                    await openBrewInstallInTerminal();
                    toast.style = Toast.Style.Success;
                    toast.title = "Terminal opened";
                    toast.message =
                      "Complete the Homebrew install, then run Log in from Raycast.";
                    toast.primaryAction = {
                      title: "Log In",
                      onAction: async () => {
                        await launchCommand({
                          name: "login",
                          type: LaunchType.UserInitiated,
                        });
                      },
                    };
                  } catch (err) {
                    toast.style = Toast.Style.Failure;
                    toast.title = "Could not open Terminal";
                    toast.message =
                      err instanceof Error ? err.message : String(err);
                  }
                }}
              />
            )}
            <Action.OpenInBrowser
              title="Open NordVPN Download Page"
              url={NORDVPN_DOWNLOAD_URL}
              icon={Icon.Globe}
            />
            {!brew && (
              <Action.OpenInBrowser
                title="Install Homebrew"
                url={HOMEBREW_URL}
                icon={Icon.Globe}
              />
            )}
            {brew && (
              <Action.CopyToClipboard
                title="Copy Install Command"
                content={NORDVPN_INSTALL_COMMAND}
                icon={Icon.Clipboard}
              />
            )}
            <Action.CopyToClipboard
              title="Copy Login Command"
              content={NORDVPN_LOGIN_COMMAND}
              icon={Icon.Clipboard}
            />
            {onRecheck && (
              <Action
                title="Recheck"
                icon={Icon.ArrowClockwise}
                onAction={onRecheck}
              />
            )}
            <Action
              title="Open Log in Command"
              icon={Icon.Lock}
              onAction={async () => {
                await launchCommand({
                  name: "login",
                  type: LaunchType.UserInitiated,
                });
              }}
            />
          </ActionPanel>
        }
      />
    </List>
  );
}

export function useCliInstalled() {
  const { data, isLoading, revalidate } = useCachedPromise(
    async () => findNordvpnBinary() !== null,
    [],
    { keepPreviousData: true, initialData: findNordvpnBinary() !== null },
  );
  return { installed: data ?? false, isLoading, revalidate };
}
