import { createContext, useState, useCallback, useContext, useRef, useMemo } from "react";

import { setupStore, AppStore, RootState } from "@Src/store";
import { $AppSettings } from "@Src/services";
import { updateUI } from "@Store/ui-slice";

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

export function useStoreSnapshot<T>(selector: (state: RootState) => T): T {
  const storeContext = useStoreContext();
  return useMemo(() => selector(storeContext.getState()), []);
}

interface DynamicStoreProviderProps {
  children: (config: ReturnType<typeof setupStore>) => React.ReactElement;
}
export function DynamicStoreProvider(props: DynamicStoreProviderProps) {
  const [config, setConfig] = useState(setupStore({ persistingUserData: $AppSettings.get("persistingUserData") }));

  const changeConfig: ChangeConfigFn = useCallback(({ persistingUserData }) => {
    const newConfig = setupStore({ persistingUserData });

    setConfig(newConfig);
    newConfig.store.dispatch(updateUI({ ready: true }));
  }, []);

  return (
    <DynamicStoreControlContext.Provider value={changeConfig}>
      <DynamicStoreContext.Provider value={config.store}>{props.children(config)}</DynamicStoreContext.Provider>
    </DynamicStoreControlContext.Provider>
  );
}
