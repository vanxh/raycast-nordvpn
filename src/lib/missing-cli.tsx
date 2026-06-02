import {
  Action,
  ActionPanel,
  Icon,
  launchCommand,
  LaunchType,
  List,
} from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import {
  findBrewBinary,
  findNordvpnBinary,
  HOMEBREW_URL,
  NORDVPN_DOWNLOAD_URL,
  NORDVPN_LOGIN_COMMAND,
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
    ? "NordVPN's macOS Homebrew package installs the app only; it does not provide a `nordvpn` CLI binary. This CLI-only extension needs a real CLI path in preferences."
    : "NordVPN CLI was not found. This CLI-only extension needs a real `nordvpn` binary path in preferences.";

  return (
    <List>
      <List.EmptyView
        icon={{ source: Icon.ExclamationMark }}
        title="NordVPN CLI Not Found"
        description={description}
        actions={
          <ActionPanel>
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
