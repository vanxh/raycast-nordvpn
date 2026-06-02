import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { getSettings, isOn, runNordvpn, withToast } from "./lib/nordvpn";

interface Toggle {
  key: string;
  title: string;
  flag: string;
}

const TOGGLES: Toggle[] = [
  { key: "kill switch", title: "Kill Switch", flag: "killswitch" },
  { key: "auto-connect", title: "Auto-connect", flag: "autoconnect" },
  {
    key: "threat protection lite",
    title: "Threat Protection Lite",
    flag: "threatprotectionlite",
  },
  { key: "notify", title: "Notifications", flag: "notify" },
  { key: "routing", title: "Routing", flag: "routing" },
  { key: "analytics", title: "Analytics", flag: "analytics" },
  { key: "ipv6", title: "IPv6", flag: "ipv6" },
  { key: "obfuscate", title: "Obfuscation", flag: "obfuscate" },
  { key: "meshnet", title: "Meshnet", flag: "meshnet" },
  { key: "lan-discovery", title: "LAN Discovery", flag: "lan-discovery" },
  {
    key: "virtual-location",
    title: "Virtual Location",
    flag: "virtual-location",
  },
];

export default function SettingsCommand() {
  const { data, isLoading, revalidate } = useCachedPromise(getSettings, [], {
    keepPreviousData: true,
  });

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search settings…">
      <List.Section title="Toggles">
        {TOGGLES.map((t) => {
          const current = findField(data?.fields ?? {}, t.key);
          const on = isOn(current);
          const present = current !== undefined;
          return (
            <List.Item
              key={t.flag}
              title={t.title}
              subtitle={present ? (on ? "On" : "Off") : "Unknown"}
              icon={{
                source: on ? Icon.CheckCircle : Icon.Circle,
                tintColor: on ? Color.Green : Color.SecondaryText,
              }}
              actions={
                <ActionPanel>
                  <Action
                    title={on ? `Disable ${t.title}` : `Enable ${t.title}`}
                    icon={on ? Icon.XMarkCircle : Icon.CheckCircle}
                    onAction={async () => {
                      const next = on ? "off" : "on";
                      await withToast(
                        `${on ? "Disabling" : "Enabling"} ${t.title}…`,
                        () => runNordvpn(["set", t.flag, next]),
                        `${t.title} ${on ? "disabled" : "enabled"}`,
                      );
                      revalidate();
                    }}
                  />
                  <Action
                    title="Refresh"
                    icon={Icon.ArrowClockwise}
                    onAction={revalidate}
                  />
                </ActionPanel>
              }
            />
          );
        })}
      </List.Section>
      <List.Section title="Info">
        {Object.entries(data?.fields ?? {})
          .filter(([k]) => !TOGGLES.some((t) => k.includes(t.key)))
          .map(([k, v]) => (
            <List.Item
              key={k}
              title={titleCase(k)}
              accessories={[{ text: v }]}
              icon={Icon.Dot}
              actions={
                <ActionPanel>
                  <Action.CopyToClipboard content={v} />
                </ActionPanel>
              }
            />
          ))}
      </List.Section>
    </List>
  );
}

function findField(
  fields: Record<string, string>,
  key: string,
): string | undefined {
  if (fields[key]) return fields[key];
  for (const [k, v] of Object.entries(fields)) {
    if (k.includes(key)) return v;
  }
  return undefined;
}

function titleCase(s: string): string {
  return s
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
