import type { Action, ThunkAction } from "@reduxjs/toolkit";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";

import uiSliceReducers, { uiSlice } from "./uiSlice";

export type SetupStoreArgs = { persistingUserData?: boolean };

export const setupStore = (args?: SetupStoreArgs) => {
  const rootReducer = combineReducers({
    ui: uiSliceReducers,
  });

  const persistConfig = {
    key: "root",
    version: 0,
    storage,
    blacklist: [uiSlice.name],
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
};

export type AppStore = ReturnType<typeof setupStore>["store"];

export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
