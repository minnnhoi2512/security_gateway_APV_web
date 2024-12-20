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
    getImageVehicleSessionByVisit: builder.query<any, { visitId: number }>({
      query: ({ visitId }) => {
        return {
          url: `VehicleSession/Visit/${visitId}`,
          method: "GET",
        };
      },
    }),
    getImageVehicleSessionByVisitor: builder.query<
      any,
      { visitId: number; visitorId: number }
    >({
      query: ({ visitId, visitorId }) => {
        return {
          url: `VehicleSession/Visit/${visitId}/Visitor/${visitorId}`,
          method: "GET",
        };
      },
    }),
    getListSession: builder.query<any, any>({
      query: () => {
        return {
          url: "",
          method: "GET",
          params: {
            pageNumber: 1,
            pageSize: 100,
          },
        };
      },
    }),
  }),
});

// Export the auto-generated hook for the query
export const {
  useGetImageVehicleSessionQuery,
  useGetListSessionQuery,
  useGetImageVehicleSessionByVisitQuery,
  useGetImageVehicleSessionByVisitorQuery,
} = sessionImageAPI;
