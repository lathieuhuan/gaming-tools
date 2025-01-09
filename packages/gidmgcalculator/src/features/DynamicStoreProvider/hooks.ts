import { AppStore, RootState } from "@Src/store";
import { useContext, useMemo } from "react";
import { DynamicStoreContext, DynamicStoreControlContext } from "./DynamicStore.context";

export const useDynamicStoreControl = () => {
  return useContext(DynamicStoreControlContext);
};

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
