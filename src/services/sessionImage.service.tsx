import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";
import { getToken } from "../utils/jwtToken";

export const sessionImageAPI = createApi({
  reducerPath: "sessionImageAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseAPI}/api/VisitorSession`,
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
    getImageVehicleSession: builder.query<any, { id: number }>({
      query: ({ id }) => {
        return {
          url: `VehicleSession/${id}`,
          method: "GET",
        };
      },
    }),
  }),
});

// Export the auto-generated hook for the query
export const { useGetImageVehicleSessionQuery } = sessionImageAPI;
