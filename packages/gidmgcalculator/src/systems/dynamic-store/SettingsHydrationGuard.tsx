import { useSettingsStore } from "@Store/settings";
import { useLayoutEffect, useState } from "react";

export const SettingsHydrationGuard = ({ children }: { children: React.ReactNode }) => {
  const [hydrated, setHydrated] = useState(false);

  useLayoutEffect(() => {
    const rehydrate = async () => {
      await useSettingsStore.persist.rehydrate();
      setHydrated(true);
    };

    void rehydrate();
  }, []);

  if (!hydrated) {
    return null;
  }

  return children;
};
