import { configureStore } from "@reduxjs/toolkit";
import { userAPI } from "../services/user.service";
import { visitListAPI } from "../services/visitList.service";
import { visitDetailListAPI } from "../services/visitDetailList.service";
import { setupListeners } from "@reduxjs/toolkit/query";
import { scheduleAPI } from "../services/schedule.service";
import { qrCardAPI } from "../services/qrCard.service";
import { departmentAPI } from "../services/department.service";
import { visitorAPI } from "../services/visitor.service";
import { scheduleTypeAPI } from "../services/scheduleType.service";

export const store = configureStore({
  reducer: {
    [userAPI.reducerPath]: userAPI.reducer,
    [visitListAPI.reducerPath]: visitListAPI.reducer,
    [visitDetailListAPI.reducerPath]: visitDetailListAPI.reducer,
    [scheduleAPI.reducerPath]: scheduleAPI.reducer,
    [qrCardAPI.reducerPath]: qrCardAPI.reducer,
    [departmentAPI.reducerPath]: departmentAPI.reducer,
    [visitorAPI.reducerPath]: visitorAPI.reducer,
    [scheduleTypeAPI.reducerPath]: scheduleTypeAPI.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userAPI.middleware)
      .concat(visitListAPI.middleware)
      .concat(visitDetailListAPI.middleware)
      .concat(qrCardAPI.middleware)
      .concat(scheduleAPI.middleware)
      .concat(departmentAPI.middleware)
      .concat(visitorAPI.middleware)
      .concat(scheduleTypeAPI.middleware)
      .concat(departmentAPI.middleware),
});

// Define RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Setup listeners for automatic refetching and cache invalidation
setupListeners(store.dispatch);
