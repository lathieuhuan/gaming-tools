import type { Action, ThunkAction } from "@reduxjs/toolkit";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  createMigrate,
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import { DATABASE_DATA_VERSION } from "@/constants";
import accountSliceReducers, { accountSlice } from "./account-slice";
import { migrates } from "./migration";
import uiSliceReducers, { uiSlice } from "./ui-slice";
import userdbSliceReducers, { initialState, userdbSlice } from "./userdb-slice";

type SetupStoreOptions = {
  persistUserData?: boolean;
};

export function setupStore(options?: SetupStoreOptions) {
  const userdbPersistReducers = persistReducer(
    {
      key: "database",
      version: DATABASE_DATA_VERSION,
      storage,
      blacklist: options?.persistUserData ? [] : Object.keys(initialState),
      migrate: createMigrate(migrates, { debug: false }),
    },
    userdbSliceReducers
  );

  const accountPersistReducers = persistReducer(
    {
      key: "account",
      version: 1,
      storage,
    },
    accountSliceReducers
  );

  const rootReducer = combineReducers({
    ui: uiSliceReducers,
    userdb: userdbPersistReducers,
    account: accountPersistReducers,
  });

  const persistConfig = {
    key: "root",
    version: 0,
    storage,
    blacklist: [uiSlice.name, userdbSlice.name, accountSlice.name],
  };

  const persistedReducer = persistReducer(persistConfig, rootReducer);

  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });

  const persistor = persistStore(store);

  return {
    store,
    persistor,
  };
}

export type AppStore = ReturnType<typeof setupStore>["store"];

export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
