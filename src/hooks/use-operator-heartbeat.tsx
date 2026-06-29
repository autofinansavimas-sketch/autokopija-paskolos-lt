import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Operator } from "@/hooks/use-operator";

// Sends a heartbeat every HEARTBEAT_MS that the tab is visible,
// crediting the active operator with that many seconds.
const HEARTBEAT_MS = 60_000;

export function useOperatorHeartbeat(operator: Operator | null) {
  const lastTickRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!operator) return;

    let cancelled = false;
    lastTickRef.current = Date.now();

    const send = async () => {
      if (cancelled) return;
      if (document.visibilityState !== "visible") return;
      const now = Date.now();
      const elapsedSec = Math.min(
        600,
        Math.max(0, Math.round((now - lastTickRef.current) / 1000)),
      );
      lastTickRef.current = now;
      if (elapsedSec <= 0) return;
      try {
        await supabase.rpc("increment_operator_time", {
          _operator: operator,
          _seconds: elapsedSec,
        });
        // notify listeners (e.g. stats component) to refresh
        window.dispatchEvent(new CustomEvent("operator-time-updated"));
      } catch (err) {
        console.warn("operator heartbeat failed", err);
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        // reset baseline so we don't credit time the tab was hidden
        lastTickRef.current = Date.now();
      } else {
        // flush time accumulated while visible
        void send();
      }
    };

    const interval = setInterval(send, HEARTBEAT_MS);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("beforeunload", send);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", send);
      // flush on operator change / unmount
      void send();
    };
  }, [operator]);
}
