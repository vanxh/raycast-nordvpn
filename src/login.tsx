import {
  Action,
  ActionPanel,
  Detail,
  Icon,
  open,
  showToast,
  Toast,
} from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import {
  loginNordvpn,
  NORDVPN_LOGIN_COMMAND,
  type LoginResult,
} from "./lib/nordvpn";
import { MissingCliView, useCliInstalled } from "./lib/missing-cli";

type Phase = "idle" | "running" | "url" | "logged-in" | "error";

export default function LoginCommand() {
  const cli = useCliInstalled();
  const [phase, setPhase] = useState<Phase>("idle");
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  const startLogin = async () => {
    setPhase("running");
    setUrl(null);
    setError(null);
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Starting NordVPN login…",
    });
    try {
      const result: LoginResult = await loginNordvpn({ timeoutMs: 30_000 });
      if (result.url) {
        setUrl(result.url);
        setPhase("url");
        await open(result.url);
        toast.style = Toast.Style.Success;
        toast.title = "Browser opened";
        toast.message = "Finish the login in your browser.";
      } else if (result.alreadyLoggedIn) {
        setPhase("logged-in");
        toast.style = Toast.Style.Success;
        toast.title = "Already logged in";
      } else {
        setPhase("logged-in");
        toast.style = Toast.Style.Success;
        toast.title = "Login complete";
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setPhase("error");
      toast.style = Toast.Style.Failure;
      toast.title = "Login failed";
      toast.message = msg;
    }
  };

  useEffect(() => {
    if (cli.isLoading) return;
    if (!cli.installed) return;
    if (started.current) return;
    started.current = true;
    void startLogin();
  }, [cli.installed, cli.isLoading]);

  if (!cli.installed && !cli.isLoading) {
    return (
      <MissingCliView onRecheck={cli.revalidate} showLoginAction={false} />
    );
  }

  const markdown = buildMarkdown(phase, url, error);

  return (
    <Detail
      isLoading={phase === "running" || cli.isLoading}
      markdown={markdown}
      actions={
        <ActionPanel>
          {url && (
            <Action.OpenInBrowser
              title="Open Login URL"
              url={url}
              icon={Icon.Globe}
            />
          )}
          {url && (
            <Action.CopyToClipboard
              title="Copy Login URL"
              content={url}
              icon={Icon.Clipboard}
            />
          )}
          <Action
            title={phase === "running" ? "Logging in…" : "Restart Login"}
            icon={Icon.Lock}
            onAction={startLogin}
          />
          <Action.CopyToClipboard
            title="Copy CLI Login Command"
            content={NORDVPN_LOGIN_COMMAND}
            icon={Icon.Clipboard}
          />
        </ActionPanel>
      }
    />
  );
}

function buildMarkdown(
  phase: Phase,
  url: string | null,
  error: string | null,
): string {
  if (phase === "running") {
    return [
      "# Starting NordVPN Login…",
      "",
      "Running `nordvpn login` and waiting for a browser URL.",
    ].join("\n");
  }
  if (phase === "url" && url) {
    return [
      "# Finish Login in Browser",
      "",
      "NordVPN printed a login URL and Raycast opened it in your browser.",
      "Complete the sign-in there — the CLI will receive the callback automatically.",
      "",
      "**Login URL**",
      "",
      "```",
      url,
      "```",
      "",
      "No credentials are read or stored by this extension.",
    ].join("\n");
  }
  if (phase === "logged-in") {
    return [
      "# Logged In",
      "",
      "NordVPN reports an active session. You can now use **Connect**, **Status**, and **Quick Actions**.",
    ].join("\n");
  }
  if (phase === "error" && error) {
    return [
      "# Login Failed",
      "",
      "```",
      error,
      "```",
      "",
      `If the issue persists, run \`${NORDVPN_LOGIN_COMMAND}\` in a terminal.`,
    ].join("\n");
  }
  return [
    "# NordVPN Login",
    "",
    "Press the action below to start. Raycast will open the login URL printed by the CLI.",
  ].join("\n");
}
