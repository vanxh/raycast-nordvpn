import {
  Action,
  ActionPanel,
  Icon,
  List,
  showToast,
  Toast,
} from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import {
  HOMEBREW_URL,
  isAppInstalled,
  NORDVPN_DOWNLOAD_URL,
  NORDVPN_INSTALL_COMMAND,
} from "./nordvpn";

export function MissingAppView({ onRecheck }: { onRecheck?: () => void }) {
  return (
    <List>
      <List.EmptyView
        icon={{ source: Icon.ExclamationMark }}
        title="NordVPN App Not Found"
        description={`Install the NordVPN app, then reopen this command. macOS has no NordVPN CLI — this extension drives the app via deep links. Run \`${NORDVPN_INSTALL_COMMAND}\` in a terminal, or use the download page.`}
        actions={
          <ActionPanel>
            <Action.CopyToClipboard
              title="Copy Homebrew Install Command"
              content={NORDVPN_INSTALL_COMMAND}
              icon={Icon.Clipboard}
              onCopy={async () => {
                await showToast({
                  style: Toast.Style.Success,
                  title: "Command copied",
                  message: "Paste it in a terminal to install NordVPN.",
                });
              }}
            />
            <Action.OpenInBrowser
              title="Open NordVPN Download Page"
              url={NORDVPN_DOWNLOAD_URL}
              icon={Icon.Globe}
            />
            <Action.OpenInBrowser
              title="Install Homebrew"
              url={HOMEBREW_URL}
              icon={Icon.Globe}
            />
            {onRecheck && (
              <Action
                title="Recheck"
                icon={Icon.ArrowClockwise}
                onAction={onRecheck}
              />
            )}
          </ActionPanel>
        }
      />
    </List>
  );
}

export function useAppInstalled() {
  const { data, isLoading, revalidate } = useCachedPromise(
    async () => isAppInstalled(),
    [],
    { keepPreviousData: true, initialData: isAppInstalled() },
  );
  return { installed: data ?? false, isLoading, revalidate };
}
