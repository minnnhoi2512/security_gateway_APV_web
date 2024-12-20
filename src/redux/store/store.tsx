import { configureStore } from "@reduxjs/toolkit";
import { userAPI } from "../../services/user.service";
import { visitListAPI } from "../../services/visitList.service";
import { visitDetailListAPI } from "../../services/visitDetailList.service";
import { setupListeners } from "@reduxjs/toolkit/query";
import { scheduleAPI } from "../../services/schedule.service";
import { qrCardAPI } from "../../services/QRCard.service";
import { departmentAPI } from "../../services/department.service";
import { visitorAPI } from "../../services/visitor.service";
import { scheduleTypeAPI } from "../../services/scheduleType.service";
import filterTabReducer from "../slices/filterTab.slice";
import { visitGrapqlAPI } from "../../services/visitGraphql.service";
import visitDetailListReducer from "../slices/visitDetailList.slice";
import hubConnectionReducer from "../slices/hubConnection.slice";
import notificationReducer from "../slices/notification.slice";
import { notificationAPI } from "../../services/notification.service";
import visitorSessionReducer from "../slices/visitorSession.slice";
import { scheduleUserAPI } from "../../services/scheduleUser.service";
import { rtkQueryErrorLogger } from "../../middleware";
import { scheduleStaffAPI } from "../../services/scheduleStaff.service";
import { gateAPI } from "../../services/gate.service";
import { dashBoardAPI } from "../../services/dashboard.service";
import { passwordAPI } from "../../services/forgetPassword.service";
import { sessionImageAPI } from "../../services/sessionImage.service";


export const store = configureStore({
  reducer: {
    [userAPI.reducerPath]: userAPI.reducer,
    [visitListAPI.reducerPath]: visitListAPI.reducer,
    [visitDetailListAPI.reducerPath]: visitDetailListAPI.reducer,
    [scheduleAPI.reducerPath]: scheduleAPI.reducer,
    [scheduleUserAPI.reducerPath]: scheduleUserAPI.reducer,
    [qrCardAPI.reducerPath]: qrCardAPI.reducer,
    [departmentAPI.reducerPath]: departmentAPI.reducer,
    [visitorAPI.reducerPath]: visitorAPI.reducer,
    [scheduleTypeAPI.reducerPath]: scheduleTypeAPI.reducer,
    [visitGrapqlAPI.reducerPath] : visitGrapqlAPI.reducer,
    [notificationAPI.reducerPath] : notificationAPI.reducer,
    [scheduleStaffAPI.reducerPath] : scheduleStaffAPI.reducer,
    [gateAPI.reducerPath] : gateAPI.reducer,
    [dashBoardAPI.reducerPath] : dashBoardAPI.reducer,
    [passwordAPI.reducerPath] : passwordAPI.reducer,
    [sessionImageAPI.reducerPath] : sessionImageAPI.reducer,
    filterTabs: filterTabReducer,
    visitDetailList : visitDetailListReducer,
    visitorSession : visitorSessionReducer,
    hubConnection : hubConnectionReducer,
    notification : notificationReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
      .concat(userAPI.middleware)
      .concat(visitListAPI.middleware)
      .concat(visitDetailListAPI.middleware)
      .concat(qrCardAPI.middleware)
      .concat(passwordAPI.middleware)
      .concat(scheduleAPI.middleware, rtkQueryErrorLogger)
      .concat(scheduleUserAPI.middleware)
      .concat(sessionImageAPI.middleware)
      .concat(departmentAPI.middleware)
      .concat(visitorAPI.middleware)
      .concat(scheduleTypeAPI.middleware)
      .concat(departmentAPI.middleware)
      .concat(notificationAPI.middleware)
      .concat(visitGrapqlAPI.middleware)
      .concat(gateAPI.middleware)
      .concat(scheduleStaffAPI.middleware)
      .concat(dashBoardAPI.middleware),
});

// Define RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Setup listeners for automatic refetching and cache invalidation
setupListeners(store.dispatch);
