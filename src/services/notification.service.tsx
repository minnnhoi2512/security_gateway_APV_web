import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";
import { getToken } from "../utils/jwtToken";

export const notificationAPI = createApi({
  reducerPath: "notificationAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseAPI}/api/Notification/`,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json"); // Default content type
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getListNotificationUser: builder.query<any, { userId: number | null }>({
      query: ({ userId }) => {
        return {
          url: `User/${userId}`,
          method: "GET",
        };
      },
    }),
    markNotiRead: builder.mutation<any, { notificationUserId: number | null }>({
      query: ({ notificationUserId }) => {
        return {
          url: `NotificationUser/IsRead/${notificationUserId}`,
          method: "GET",
        };
      },
    }),
  }),
});

// Export the auto-generated hook for the query
export const {
  useGetListNotificationUserQuery, useMarkNotiReadMutation
} = notificationAPI;