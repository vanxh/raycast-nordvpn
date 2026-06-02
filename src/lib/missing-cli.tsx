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
  isNordvpnControllable,
  HOMEBREW_URL,
  isNordvpnAppInstalled,
  NORDVPN_APP_PATH,
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
  const appInstalled = isNordvpnAppInstalled();

  const description = appInstalled
    ? "NordVPN.app is installed, but the macOS app/cask did not add a `nordvpn` CLI binary. Open the NordVPN app and sign in there, or set a custom CLI path in extension preferences if you have one."
    : brew
      ? `Install the NordVPN CLI to use this extension. Recommended: run \`${NORDVPN_INSTALL_COMMAND}\` (Homebrew detected). After installing, run \`${NORDVPN_LOGIN_COMMAND}\` in a terminal to sign in.`
      : `Install the NordVPN CLI to use this extension. Download from nordvpn.com or install Homebrew first to use \`${NORDVPN_INSTALL_COMMAND}\`. After installing, run \`${NORDVPN_LOGIN_COMMAND}\` in a terminal to sign in.`;

  return (
    <List>
      <List.EmptyView
        icon={{ source: Icon.ExclamationMark }}
        title={appInstalled ? "NordVPN CLI Missing" : "NordVPN CLI Not Found"}
        description={description}
        actions={
          <ActionPanel>
            {appInstalled && (
              <Action.Open
                title="Open NordVPN App"
                target={NORDVPN_APP_PATH}
                icon={Icon.AppWindow}
              />
            )}
            {brew && !appInstalled && (
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
                    toast.title = "NordVPN installed";
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
    async () => isNordvpnControllable(),
    [],
    { keepPreviousData: true, initialData: isNordvpnControllable() },
  );
  return { installed: data ?? false, isLoading, revalidate };
}
