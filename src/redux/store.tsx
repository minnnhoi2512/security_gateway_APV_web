import { configureStore } from "@reduxjs/toolkit";
import { userAPI } from "../services/user.service";
import { visitListAPI } from "../services/visitList.service";
import { visitDetailListAPI } from "../services/visitDetailList.service";
import { setupListeners } from "@reduxjs/toolkit/query";

export const store = configureStore({
  reducer: {
    [userAPI.reducerPath]: userAPI.reducer,
    [visitListAPI.reducerPath]: visitListAPI.reducer,
    [visitDetailListAPI.reducerPath]: visitDetailListAPI.reducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userAPI.middleware) 
      .concat(visitListAPI.middleware)
      .concat(visitDetailListAPI.middleware), 
});

// Define RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Setup listeners for automatic refetching and cache invalidation
setupListeners(store.dispatch);