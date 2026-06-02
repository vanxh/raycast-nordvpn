import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { getStatus, runNordvpn, withToast } from "./lib/nordvpn";

const ORDERED_KEYS = [
  "status",
  "hostname",
  "ip",
  "country",
  "city",
  "server ip",
  "current technology",
  "current protocol",
  "transfer",
  "uptime",
];

export default function StatusCommand() {
  const { data, isLoading, revalidate } = useCachedPromise(getStatus, [], {
    keepPreviousData: true,
  });

  const connected = data?.connected ?? false;

  return (
    <List isLoading={isLoading}>
      <List.Section title="State">
        <List.Item
          title={connected ? "Connected" : "Disconnected"}
          icon={{
            source: connected ? Icon.CheckCircle : Icon.XMarkCircle,
            tintColor: connected ? Color.Green : Color.Red,
          }}
          actions={
            <ActionPanel>
              <Action
                title="Refresh"
                icon={Icon.ArrowClockwise}
                onAction={revalidate}
              />
              {connected ? (
                <Action
                  title="Disconnect"
                  icon={Icon.XMarkCircle}
                  style={Action.Style.Destructive}
                  onAction={async () => {
                    await withToast(
                      "Disconnecting…",
                      () => runNordvpn(["disconnect"]),
                      "Disconnected",
                    );
                    revalidate();
                  }}
                />
              ) : (
                <Action
                  title="Connect (Fastest)"
                  icon={Icon.Bolt}
                  onAction={async () => {
                    await withToast(
                      "Connecting…",
                      () => runNordvpn(["connect"], { timeoutMs: 60_000 }),
                      "Connected",
                    );
                    revalidate();
                  }}
                />
              )}
            </ActionPanel>
          }
        />
      </List.Section>
      {data && Object.keys(data.fields).length > 0 && (
        <List.Section title="Details">
          {orderedFields(data.fields).map(([key, value]) => (
            <List.Item
              key={key}
              title={titleCase(key)}
              accessories={[{ text: value }]}
              icon={iconFor(key)}
              actions={
                <ActionPanel>
                  <Action.CopyToClipboard content={value} />
                  <Action
                    title="Refresh"
                    icon={Icon.ArrowClockwise}
                    onAction={revalidate}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}
    </List>
  );
}

function orderedFields(
  fields: Record<string, string>,
): Array<[string, string]> {
  const entries = Object.entries(fields);
  const indexOf = (k: string) => {
    const i = ORDERED_KEYS.indexOf(k);
    return i === -1 ? ORDERED_KEYS.length : i;
  };
  return entries.sort(([a], [b]) => indexOf(a) - indexOf(b));
}

function titleCase(s: string): string {
  return s
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function iconFor(key: string): Icon {
  if (key.includes("ip")) return Icon.Globe;
  if (key.includes("country") || key.includes("city")) return Icon.Pin;
  if (key.includes("uptime")) return Icon.Clock;
  if (key.includes("transfer")) return Icon.Network;
  if (key.includes("technology") || key.includes("protocol")) return Icon.Gear;
  if (key.includes("host") || key.includes("server")) return Icon.HardDrive;
  return Icon.Dot;
}
