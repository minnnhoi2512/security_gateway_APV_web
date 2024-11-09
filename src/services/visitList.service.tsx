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
    getListVisit: builder.query<any, { pageNumber: number; pageSize: number}>({
      query: ({ pageNumber, pageSize }) => {
        return {
          url: "/",
          method: "GET",
          params: {
            pageNumber,
            pageSize,
    
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
    getListVisitByResponsiblePersonId: builder.query<
    any,
    { id: number; pageNumber: number; pageSize: number }
  >({
    query: ({ id, pageNumber, pageSize }) => {
      return {
        url: `ResponePerson/${id}`,
        method: "GET",
        params: {
          pageNumber,
          pageSize,
        },
      };
    },
  }),
    getListVisitByDepartmentId: builder.query<
      any,
      { departmentId: number; pageNumber: number; pageSize: number }
    >({
      query: ({ departmentId, pageNumber, pageSize }) => {
        return {
          url: `DepartmentId/${departmentId}`,
          method: "GET",
          params: {
            pageNumber,
            pageSize,
          },
        };
      },
    }),
    getVisitByScheduleUserId: builder.query<
      any,
      { scheduleUserId: number }
    >({
      query: ({ scheduleUserId }) => {
        return {
          url: `ScheduleUserId/${scheduleUserId}`,
          method: "GET",
          params: {

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
  useGetListVisitByDepartmentIdQuery,
  useGetVisitByScheduleUserIdQuery,
  useGetListVisitByResponsiblePersonIdQuery
} = visitListAPI;
