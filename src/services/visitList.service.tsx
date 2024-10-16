import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";
import { getToken } from "../utils/jwtToken";

export const visitListAPI = createApi({
  reducerPath: "visitListAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseAPI}/api/Visit/`,
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
    getListVisit: builder.query<any, { pageNumber: number; pageSize: number,status : string }>({
      query: ({ pageNumber, pageSize,status }) => {
        return {
          url: "/Status",
          method: "GET",
          params: {
            pageNumber,
            pageSize,
            status,
          },
        };
      },
    }),
    getListVisitByCreatedId: builder.query<
      any,
      { createdById: number; pageNumber: number; pageSize: number }
    >({
      query: ({ createdById, pageNumber, pageSize }) => {
        return {
          url: `CreateBy/${createdById}`,
          method: "GET",
          params: {
            pageNumber,
            pageSize,
          },
        };
      },
    }),
    getListVisitByDepartmentManagerId: builder.query<
      any,
      { DepartmentManagerId: number; pageNumber: number; pageSize: number }
    >({
      query: ({ DepartmentManagerId, pageNumber, pageSize }) => {
        return {
          url: `DepartmentManagerId/${DepartmentManagerId}`,
          method: "GET",
          params: {
            pageNumber,
            pageSize,
          },
        };
      },
    }),
  }),
});

// Export the auto-generated hook for the query
export const {
  useGetListVisitQuery,
  useGetListVisitByCreatedIdQuery,
  useGetListVisitByDepartmentManagerIdQuery,
} = visitListAPI;
