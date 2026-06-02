import {
  Action,
  ActionPanel,
  getPreferenceValues,
  Icon,
  List,
} from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import {
  getStatus,
  runNordvpn,
  sanitizeLocation,
  withToast,
  type Preferences,
} from "./lib/nordvpn";

interface QuickAction {
  id: string;
  title: string;
  subtitle?: string;
  icon: Icon;
  args: string[];
  toast: string;
  successTitle: string;
  timeoutMs?: number;
}

export default function QuickActionsCommand() {
  const prefs = getPreferenceValues<Preferences>();
  const { data, isLoading, revalidate } = useCachedPromise(getStatus, [], {
    keepPreviousData: true,
  });

  const actions: QuickAction[] = [];

  actions.push({
    id: "fastest",
    title: "Connect Fastest",
    icon: Icon.Bolt,
    args: ["connect"],
    toast: "Connecting…",
    successTitle: "Connected",
    timeoutMs: 60_000,
  });

  if (prefs.defaultLocation?.trim()) {
    const loc = sanitizeLocation(prefs.defaultLocation);
    actions.push({
      id: "default-location",
      title: "Connect Default Location",
      subtitle: loc,
      icon: Icon.Pin,
      args: ["connect", loc],
      toast: `Connecting to ${loc}…`,
      successTitle: "Connected",
      timeoutMs: 60_000,
    });
  }

  actions.push(
    {
      id: "p2p",
      title: "Connect P2P",
      icon: Icon.TwoPeople,
      args: ["connect", "--group", "P2P"],
      toast: "Connecting to P2P…",
      successTitle: "Connected",
      timeoutMs: 60_000,
    },
    {
      id: "double",
      title: "Connect Double VPN",
      icon: Icon.Shield,
      args: ["connect", "--group", "Double_VPN"],
      toast: "Connecting to Double VPN…",
      successTitle: "Connected",
      timeoutMs: 60_000,
    },
    {
      id: "onion",
      title: "Connect Onion Over VPN",
      icon: Icon.EyeDisabled,
      args: ["connect", "--group", "Onion_Over_VPN"],
      toast: "Connecting to Onion Over VPN…",
      successTitle: "Connected",
      timeoutMs: 60_000,
    },
    {
      id: "disconnect",
      title: "Disconnect",
      icon: Icon.XMarkCircle,
      args: ["disconnect"],
      toast: "Disconnecting…",
      successTitle: "Disconnected",
    },
    {
      id: "reconnect",
      title: "Reconnect",
      icon: Icon.ArrowClockwise,
      args: ["reconnect"],
      toast: "Reconnecting…",
      successTitle: "Reconnected",
      timeoutMs: 60_000,
    },
  );

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search actions…">
      <List.Section title={data?.connected ? "Connected" : "Disconnected"}>
        {actions.map((a) => (
          <List.Item
            key={a.id}
            title={a.title}
            subtitle={a.subtitle}
            icon={a.icon}
            actions={
              <ActionPanel>
                <Action
                  title={a.title}
                  icon={a.icon}
                  onAction={async () => {
                    await withToast(
                      a.toast,
                      () => runNordvpn(a.args, { timeoutMs: a.timeoutMs }),
                      a.successTitle,
                    );
                    revalidate();
                  }}
                />
                <Action
                  title="Refresh Status"
                  icon={Icon.ArrowClockwise}
                  onAction={revalidate}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
