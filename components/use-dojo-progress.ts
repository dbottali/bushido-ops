"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createProgressStore, PROGRESS_KEY } from "@/lib/dojo-progress";

export function useDojoProgress() {
  const [store] = useState(createProgressStore);
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  useEffect(() => {
    store.hydrate({ getItem: key => window.localStorage.getItem(key), setItem: (key, value) => window.localStorage.setItem(key, value) });
    const receive = (event: StorageEvent) => {
      try {
        if ((event.key === PROGRESS_KEY || event.key === null) && event.storageArea === window.localStorage) store.receiveExternal(event.newValue);
      } catch { /* A browser denying storage still allows practice. */ }
    };
    window.addEventListener("storage", receive);
    return () => window.removeEventListener("storage", receive);
  }, [store]);
  return { store, snapshot };
}
