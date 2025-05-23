import { createContext } from "react";
import type { AppStore } from "@Src/store";

export type UpdateStoreConfig = (args: Partial<{ persistingUserData: boolean }>) => void;

export const DynamicStoreControlContext = createContext<UpdateStoreConfig>(() => {});

export const DynamicStoreContext = createContext<AppStore | null>(null);
