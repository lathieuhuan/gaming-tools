import { ReactElement, useLayoutEffect, useState } from "react";

import { setupStore } from "@/store";
import { useSettingsStore } from "@Store/settings";
import { updateUI } from "@Store/ui";
import { addUserDatabase } from "@Store/userdb-slice";
import { DynamicStoreContext } from "./_context";

import { SettingsHydrationGuard } from "./SettingsHydrationGuard";

type StoreConfig = ReturnType<typeof setupStore>;

type DynamicStoreProviderProps = {
  children: (config: StoreConfig) => ReactElement;
};

function DynamicStoreControl(props: DynamicStoreProviderProps) {
  const [config, setConfig] = useState(() =>
    setupStore({
      persistUserData: useSettingsStore.getState().persistUserData,
    })
  );

  useLayoutEffect(() => {
    const currentPersistUserData = useSettingsStore.getState().persistUserData;

    return useSettingsStore.subscribe(({ persistUserData }) => {
      if (persistUserData === currentPersistUserData) {
        return;
      }

      const newConfig = setupStore({ persistUserData });
      const oldStoreState = config.store.getState();

      if (oldStoreState) {
        const { userdb } = oldStoreState;

        newConfig.store.dispatch(
          addUserDatabase({
            characters: userdb.userChars,
            weapons: userdb.userWps,
            artifacts: userdb.userArts,
            setups: userdb.userSetups,
          })
        );
      }

      setConfig(newConfig);
      updateUI({ appReady: true });
    });
  }, [config]);

  return (
    <DynamicStoreContext.Provider value={config}>
      {props.children(config)}
    </DynamicStoreContext.Provider>
  );
}

export function DynamicStoreProvider(props: DynamicStoreProviderProps) {
  return (
    <SettingsHydrationGuard>
      <DynamicStoreControl {...props} />
    </SettingsHydrationGuard>
  );
}
