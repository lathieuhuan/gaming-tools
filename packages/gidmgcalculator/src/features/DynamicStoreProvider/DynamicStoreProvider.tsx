import { createContext, useState, useCallback, useContext, useMemo, useRef } from "react";

import { setupStore, AppStore, RootState } from "@Src/store";
import { $AppSettings } from "@Src/services";
import { updateUI } from "@Store/ui-slice";
import { updateCalculator } from "@Store/calculator-slice";
import { addUserDatabase } from "@Store/userdb-slice";

type ChangeConfigFn = (args: Partial<{ persistingUserData: boolean }>) => void;

export const DynamicStoreControlContext = createContext<ChangeConfigFn>(() => {});

export const DynamicStoreContext = createContext<AppStore | null>(null);

const useStoreContext = (): AppStore => {
  const storeContext = useContext(DynamicStoreContext);
  if (!storeContext) {
    throw new Error("No store found");
  }
  return storeContext;
};

export function useStore() {
  const storeContext = useStoreContext();

  function select<T>(selector: (state: RootState) => T): T;
  function select(): AppStore;
  function select<T>(selector?: (state: RootState) => T): T | AppStore {
    return selector ? selector(storeContext.getState()) : storeContext;
  }
  return {
    select,
  };
}

export function useStoreSnapshot<T>(selector: (state: RootState) => T, deps: React.DependencyList = []): T {
  const storeContext = useStoreContext();
  return useMemo(() => selector(storeContext.getState()), deps);
}

type StoreConfig = ReturnType<typeof setupStore>;

interface DynamicStoreProviderProps {
  children: (config: StoreConfig) => React.ReactElement;
}
export function DynamicStoreProvider(props: DynamicStoreProviderProps) {
  const [config, setConfig] = useState(setupStore({ persistingUserData: $AppSettings.get("persistingUserData") }));
  const store = useRef<StoreConfig["store"]>();

  store.current = config.store;

  const changeConfig: ChangeConfigFn = useCallback(({ persistingUserData }) => {
    const newConfig = setupStore({ persistingUserData });
    const oldStoreState = store.current?.getState();

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
  }, []);

  return (
    <DynamicStoreControlContext.Provider value={changeConfig}>
      <DynamicStoreContext.Provider value={config.store}>{props.children(config)}</DynamicStoreContext.Provider>
    </DynamicStoreControlContext.Provider>
  );
}
