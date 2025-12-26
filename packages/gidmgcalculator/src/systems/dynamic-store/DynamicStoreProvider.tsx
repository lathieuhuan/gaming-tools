import { ReactElement, useCallback, useState } from "react";

import { $AppSettings } from "@/services";
import { setupStore } from "@/store";
import { updateUI } from "@Store/ui-slice";
import { addUserDatabase } from "@Store/userdb-slice";
import { DynamicStoreContext, DynamicStoreControlContext, type UpdateStoreConfig } from "./context";

type StoreConfig = ReturnType<typeof setupStore>;

type DynamicStoreProviderProps = {
  children: (config: StoreConfig) => ReactElement;
};

export function DynamicStoreProvider(props: DynamicStoreProviderProps) {
  const [config, setConfig] = useState(
    setupStore({ persistUserData: $AppSettings.get("persistUserData") })
  );

  const changeConfig: UpdateStoreConfig = useCallback(
    ({ persistUserData }) => {
      const newConfig = setupStore({ persistUserData });
      const oldStoreState = config.store.getState();

      setConfig(newConfig);

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

      newConfig.store.dispatch(updateUI({ appReady: true }));
    },
    [config]
  );

  return (
    <DynamicStoreControlContext.Provider value={changeConfig}>
      <DynamicStoreContext.Provider value={config}>
        {props.children(config)}
      </DynamicStoreContext.Provider>
    </DynamicStoreControlContext.Provider>
  );
}
