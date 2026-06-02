import {
  Action,
  ActionPanel,
  Clipboard,
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
  installNordvpnViaBrew,
} from "./nordvpn";

export function MissingCliView({
  onRecheck,
  showLoginAction = true,
}: {
  onRecheck?: () => void;
  showLoginAction?: boolean;
}) {
  const brew = findBrewBinary();

  const description = brew
    ? `Install the NordVPN CLI to use this extension. Recommended: run \`${NORDVPN_INSTALL_COMMAND}\` (Homebrew detected). If Homebrew only installs the macOS app and no CLI binary appears, set a real CLI path in extension preferences.`
    : `Install the NordVPN CLI to use this extension. Install Homebrew first to use \`${NORDVPN_INSTALL_COMMAND}\`, or set a real CLI path in extension preferences.`;

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
                title="Install Via Homebrew"
                icon={Icon.Download}
                onAction={async () => {
                  const toast = await showToast({
                    style: Toast.Style.Animated,
                    title: "Installing NordVPN…",
                    message:
                      "Running brew install --cask nordvpn. This can take several minutes.",
                  });
                  try {
                    await installNordvpnViaBrew();
                    toast.style = Toast.Style.Success;
                    toast.title = "NordVPN CLI installed";
                    toast.message = "Run the Log in command to sign in.";
                    if (showLoginAction) {
                      toast.primaryAction = {
                        title: "Log In",
                        onAction: async () => {
                          await launchCommand({
                            name: "login",
                            type: LaunchType.UserInitiated,
                          });
                        },
                      };
                    }
                    onRecheck?.();
                  } catch (err) {
                    toast.style = Toast.Style.Failure;
                    toast.title = "Install failed";
                    toast.message =
                      err instanceof Error ? err.message : String(err);
                    toast.primaryAction = {
                      title: "Copy Install Command",
                      onAction: async () => {
                        await Clipboard.copy(NORDVPN_INSTALL_COMMAND);
                      },
                    };
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
            {showLoginAction && (
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
            )}
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
