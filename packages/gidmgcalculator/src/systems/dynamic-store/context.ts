import { createContext, useContext, useMemo } from "react";
import type { AppStore, RootState } from "@/store";

export type UpdateStoreConfig = (args: Partial<{ persistingUserData: boolean }>) => void;

export const DynamicStoreControlContext = createContext<UpdateStoreConfig>(() => {});

export const DynamicStoreContext = createContext<AppStore | null>(null);

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
