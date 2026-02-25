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

import { PERSISTED_DATA_VERSION } from "@/constants/config";
import { migrates } from "./migration";
import userdbSliceReducers, { initialState, userdbSlice } from "./userdbSlice";

type SetupStoreOptions = {
  persistUserData?: boolean;
};

export function setupStore(options?: SetupStoreOptions) {
  const userdbPersistReducers = persistReducer(
    {
      key: "database",
      version: PERSISTED_DATA_VERSION,
      storage,
      blacklist: options?.persistUserData ? [] : Object.keys(initialState),
      migrate: createMigrate(migrates, { debug: false }),
    },
    userdbSliceReducers
  );

  const rootReducer = combineReducers({
    userdb: userdbPersistReducers,
  });

  const persistConfig = {
    key: "root",
    version: 0,
    storage,
    blacklist: [userdbSlice.name],
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
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
