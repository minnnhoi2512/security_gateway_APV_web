import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";
import { getToken } from "../utils/jwtToken";


// Create the API service
export const scheduleTypeAPI = createApi({
  reducerPath: "scheduleTypeAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseAPI}/api/ScheduleType`, // Ensure correct base URL, no need for trailing slash
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
    getListScheduleType: builder.query<any[], void>({
      query: () => ({
        url: "", // Empty string works since baseUrl includes the main path
        method: "GET",
      }),
    }),
  }),
});

// Export the auto-generated hooks for the queries
export const { useGetListScheduleTypeQuery } = scheduleTypeAPI;
