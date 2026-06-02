import {
  Action,
  ActionPanel,
  getPreferenceValues,
  Icon,
  List,
} from "@raycast/api";
import {
  buildConnectUrl,
  COUNTRIES,
  DISCONNECT_URL,
  fireDeepLink,
  openApp,
  sanitizeCountry,
  withToast,
  type Preferences,
} from "./lib/nordvpn";
import { MissingAppView, useAppInstalled } from "./lib/missing-app";

interface QuickAction {
  id: string;
  title: string;
  subtitle?: string;
  icon: Icon;
  url: string;
  toast: string;
  successTitle: string;
}

export default function QuickActionsCommand() {
  const app = useAppInstalled();
  const prefs = getPreferenceValues<Preferences>();

  if (!app.installed && !app.isLoading) {
    return <MissingAppView onRecheck={app.revalidate} />;
  }

  const actions: QuickAction[] = [
    {
      id: "fastest",
      title: "Connect Fastest",
      icon: Icon.Bolt,
      url: buildConnectUrl({ mode: "fastest" }),
      toast: "Connecting (fastest)…",
      successTitle: "Sent to NordVPN",
    },
  ];

  const defaultCountry = sanitizeCountry(prefs.defaultCountry ?? "");
  const known = COUNTRIES.find((c) => c.code === defaultCountry);
  if (defaultCountry) {
    actions.push({
      id: "default-country",
      title: "Connect Default Country",
      subtitle: known?.name ?? defaultCountry.toUpperCase(),
      icon: Icon.Pin,
      url: buildConnectUrl({ mode: "country", country: defaultCountry }),
      toast: `Connecting to ${known?.name ?? defaultCountry.toUpperCase()}…`,
      successTitle: "Sent to NordVPN",
    });
  }

  actions.push(
    {
      id: "p2p",
      title: "Connect P2P",
      icon: Icon.TwoPeople,
      url: buildConnectUrl({ mode: "group", group: "p2p" }),
      toast: "Connecting to P2P…",
      successTitle: "Sent to NordVPN",
    },
    {
      id: "double",
      title: "Connect Double VPN",
      icon: Icon.Shield,
      url: buildConnectUrl({ mode: "group", group: "double_vpn" }),
      toast: "Connecting to Double VPN…",
      successTitle: "Sent to NordVPN",
    },
    {
      id: "disconnect",
      title: "Disconnect",
      icon: Icon.XMarkCircle,
      url: DISCONNECT_URL,
      toast: "Disconnecting…",
      successTitle: "Sent to NordVPN",
    },
  );

  return (
    <List isLoading={app.isLoading} searchBarPlaceholder="Search actions…">
      <List.Section title="NordVPN">
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
                  onAction={() =>
                    withToast(
                      a.toast,
                      () => fireDeepLink(a.url),
                      a.successTitle,
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
        ))}
      </List.Section>
    </List>
  );
}
