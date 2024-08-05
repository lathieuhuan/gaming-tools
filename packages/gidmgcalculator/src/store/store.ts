import type { Action, ThunkAction } from "@reduxjs/toolkit";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";

import calculatorSliceReducers, { calculatorSlice } from "./calculator-slice";
import uiSliceReducers, { uiSlice } from "./ui-slice";
import userdbSliceReducers, { userdbSlice, initialState } from "./userdb-slice";
import simulatorSliceReducers, { simulatorSlice } from "./simulator-slice";

export type SetupStoreArgs = { persistingUserData?: boolean };

export function setupStore(args?: { persistingUserData?: boolean }) {
  const userdbPersistReducers = persistReducer(
    {
      key: "database",
      version: 0,
      storage,
      blacklist: args?.persistingUserData ? [] : Object.keys(initialState),
    },
    userdbSliceReducers
  );

  const simulatorPersistReducers = persistReducer(
    {
      key: "simulator",
      version: 0,
      storage,
      // blacklist: args?.persistingUserData ? [] : Object.keys(initialState),
      whitelist: ['simulations']
    },
    simulatorSliceReducers
  );

  const rootReducer = combineReducers({
    calculator: calculatorSliceReducers,
    simulator: simulatorPersistReducers,
    ui: uiSliceReducers,
    userdb: userdbPersistReducers,
  });

  const persistConfig = {
    key: "root",
    version: 0,
    storage,
    blacklist: [calculatorSlice.name, uiSlice.name, userdbSlice.name, simulatorSlice.name],
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
