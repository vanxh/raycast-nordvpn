import {
  Action,
  ActionPanel,
  Form,
  getPreferenceValues,
  popToRoot,
  showToast,
  Toast,
} from "@raycast/api";
import { useForm } from "@raycast/utils";
import {
  runNordvpn,
  sanitizeLocation,
  withToast,
  type Preferences,
} from "./lib/nordvpn";

interface FormValues {
  mode: string;
  location: string;
  specialty: string;
}

export default function ConnectCommand() {
  const prefs = getPreferenceValues<Preferences>();
  const defaultLocation = prefs.defaultLocation?.trim() ?? "";

  const { handleSubmit, itemProps, values } = useForm<FormValues>({
    initialValues: {
      mode: defaultLocation ? "location" : "fastest",
      location: defaultLocation,
      specialty: "P2P",
    },
    validation: {
      location: (value) => {
        if (values?.mode === "location" && !value?.trim()) {
          return "Enter a country, city, or server";
        }
        return undefined;
      },
    },
    async onSubmit(form) {
      const args: string[] = ["connect"];
      let label = "Connecting…";
      if (form.mode === "location") {
        const loc = sanitizeLocation(form.location);
        if (!loc) {
          await showToast({
            style: Toast.Style.Failure,
            title: "Location required",
          });
          return;
        }
        args.push(loc);
        label = `Connecting to ${loc}…`;
      } else if (form.mode === "specialty") {
        args.push("--group", form.specialty);
        label = `Connecting to ${form.specialty}…`;
      }
      const ok = await withToast(
        label,
        async () => {
          await runNordvpn(args, { timeoutMs: 60_000 });
        },
        "Connected",
      );
      if (ok !== undefined) await popToRoot();
    },
  });

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Connect" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Dropdown title="Mode" {...itemProps.mode}>
        <Form.Dropdown.Item value="fastest" title="Fastest" />
        <Form.Dropdown.Item value="location" title="Country / City / Server" />
        <Form.Dropdown.Item value="specialty" title="Specialty Group" />
      </Form.Dropdown>
      {values.mode === "location" && (
        <Form.TextField
          title="Location"
          placeholder="United_States, Germany, London, us1234"
          info="Spaces will be converted to underscores"
          {...itemProps.location}
        />
      )}
      {values.mode === "specialty" && (
        <Form.Dropdown title="Group" {...itemProps.specialty}>
          <Form.Dropdown.Item value="P2P" title="P2P" />
          <Form.Dropdown.Item value="Double_VPN" title="Double VPN" />
          <Form.Dropdown.Item value="Onion_Over_VPN" title="Onion Over VPN" />
          <Form.Dropdown.Item value="Dedicated_IP" title="Dedicated IP" />
          <Form.Dropdown.Item
            value="Standard_VPN_Servers"
            title="Standard VPN Servers"
          />
        </Form.Dropdown>
      )}
      <Form.Description text="Tip: Set a Default Location in extension preferences to skip this form." />
    </Form>
  );
}
