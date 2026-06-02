import {
  Action,
  ActionPanel,
  Form,
  getPreferenceValues,
  popToRoot,
} from "@raycast/api";
import { useForm } from "@raycast/utils";
import {
  buildConnectUrl,
  COUNTRIES,
  fireDeepLink,
  GROUPS,
  sanitizeCountry,
  withToast,
  type ConnectTarget,
  type Preferences,
} from "./lib/nordvpn";
import { MissingAppView, useAppInstalled } from "./lib/missing-app";

interface FormValues {
  mode: string;
  country: string;
  group: string;
}

export default function ConnectCommand() {
  const app = useAppInstalled();
  const prefs = getPreferenceValues<Preferences>();
  const defaultCountry = sanitizeCountry(prefs.defaultCountry ?? "");
  const hasDefault = COUNTRIES.some((c) => c.code === defaultCountry);

  const { handleSubmit, itemProps, values } = useForm<FormValues>({
    initialValues: {
      mode: hasDefault ? "country" : "fastest",
      country: hasDefault ? defaultCountry : COUNTRIES[0].code,
      group: GROUPS[0].id,
    },
    async onSubmit(form) {
      const target: ConnectTarget = {
        mode: form.mode as ConnectTarget["mode"],
        country: form.country,
        group: form.group,
      };
      const label =
        form.mode === "country"
          ? `Connecting to ${countryName(form.country)}…`
          : form.mode === "group"
            ? `Connecting to ${groupTitle(form.group)}…`
            : "Connecting (fastest)…";
      const ok = await withToast(
        label,
        () => fireDeepLink(buildConnectUrl(target)),
        "Sent to NordVPN",
      );
      if (ok !== undefined) await popToRoot();
    },
  });

  if (!app.installed && !app.isLoading) {
    return <MissingAppView onRecheck={app.revalidate} />;
  }

  return (
    <Form
      isLoading={app.isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Connect" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Dropdown title="Mode" {...itemProps.mode}>
        <Form.Dropdown.Item value="fastest" title="Fastest" />
        <Form.Dropdown.Item value="country" title="Country" />
        <Form.Dropdown.Item value="group" title="Specialty Group" />
      </Form.Dropdown>
      {values.mode === "country" && (
        <Form.Dropdown title="Country" {...itemProps.country}>
          {COUNTRIES.map((c) => (
            <Form.Dropdown.Item
              key={c.code}
              value={c.code}
              title={`${c.name} (${c.code.toUpperCase()})`}
            />
          ))}
        </Form.Dropdown>
      )}
      {values.mode === "group" && (
        <Form.Dropdown title="Group" {...itemProps.group}>
          {GROUPS.map((g) => (
            <Form.Dropdown.Item key={g.id} value={g.id} title={g.title} />
          ))}
        </Form.Dropdown>
      )}
      <Form.Description text="NordVPN's macOS app is controlled via deep links. The action is sent to the app; it cannot be confirmed back here. Set a Default Country in preferences to skip this form via Quick Actions." />
    </Form>
  );
}

function countryName(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.name ?? code.toUpperCase();
}

function groupTitle(id: string): string {
  return GROUPS.find((g) => g.id === id)?.title ?? id;
}
