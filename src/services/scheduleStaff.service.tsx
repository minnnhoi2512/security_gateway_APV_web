import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";
import { getToken } from "../utils/jwtToken";

// Create the API service
export const scheduleStaffAPI = createApi({
  reducerPath: "scheduleStaffAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseAPI}/api/ScheduleUser`, // Ensure correct base URL, no need for trailing slash
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getDetailScheduleStaff: builder.query<any, number>({
      query: (id) => ({
        url: `${id}`, // Use the id passed to the query function
        method: "GET",
      }),
    }),
  }),
});

// Export the auto-generated hooks for the queries
export const { useGetDetailScheduleStaffQuery } = scheduleStaffAPI;
