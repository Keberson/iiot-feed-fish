import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import { authApi } from "#services/api/auth.api";
import { feedingApi } from "#services/api/feeding.api";
import { logsApi } from "#services/api/logs.api";
import { systemApi } from "#services/api/system.api";

import authSlice from "./slices/auth.slice";
import loadingSlice from "./slices/loading.slice";

import loadingMiddleware from "./middlewares/loading.middleware";
import messageMiddleware from "./middlewares/message.middleware";

const persistConfig = {
    key: "root",
    storage,
    whitelist: ["auth"],
};

const rootReducer = combineReducers({
    [authApi.reducerPath]: authApi.reducer,
    [feedingApi.reducerPath]: feedingApi.reducer,
    [logsApi.reducerPath]: logsApi.reducer,
    [systemApi.reducerPath]: systemApi.reducer,
    auth: authSlice.reducer,
    loading: loadingSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(
            authApi.middleware,
            feedingApi.middleware,
            logsApi.middleware,
            systemApi.middleware,
            loadingMiddleware,
            messageMiddleware
        ),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
