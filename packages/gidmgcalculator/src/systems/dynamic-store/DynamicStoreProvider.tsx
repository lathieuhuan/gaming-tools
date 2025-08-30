import { useCallback, useState } from "react";

import { $AppSettings } from "@/services";
import { setupStore } from "@/store";
import { updateCalculator } from "@Store/calculator-slice";
import { updateUI } from "@Store/ui-slice";
import { addUserDatabase } from "@Store/userdb-slice";
import { DynamicStoreContext, DynamicStoreControlContext, type UpdateStoreConfig } from "./context";

type StoreConfig = ReturnType<typeof setupStore>;

interface DynamicStoreProviderProps {
  children: (config: StoreConfig) => React.ReactElement;
}
export function DynamicStoreProvider(props: DynamicStoreProviderProps) {
  const [config, setConfig] = useState(setupStore({ persistingUserData: $AppSettings.get("persistingUserData") }));

  const changeConfig: UpdateStoreConfig = useCallback(({ persistingUserData }) => {
    const newConfig = setupStore({ persistingUserData });
    const oldStoreState = config.store.getState();

    setConfig(newConfig);

    if (oldStoreState) {
      const { userdb } = oldStoreState;

      newConfig.store.dispatch(updateCalculator(oldStoreState.calculator));
      newConfig.store.dispatch(
        addUserDatabase({
          characters: userdb.userChars,
          weapons: userdb.userWps,
          artifacts: userdb.userArts,
          setups: userdb.userSetups,
        })
      );
    }

    newConfig.store.dispatch(updateUI({ ready: true }));
  }, [config]);

  return (
    <DynamicStoreControlContext.Provider value={changeConfig}>
      <DynamicStoreContext.Provider value={config.store}>{props.children(config)}</DynamicStoreContext.Provider>
    </DynamicStoreControlContext.Provider>
  );
}
