"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Returns `true` only after the component has hydrated on the client.
 * Used to defer rendering of values that differ between server and client
 * (e.g. `next-themes`' `resolvedTheme`, which is `undefined` on the server)
 * without the `useEffect(() => setState(true), [])` anti-pattern.
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
