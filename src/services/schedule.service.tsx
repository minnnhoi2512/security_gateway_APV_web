import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Schedule from "../types/ScheduleType";
import baseAPI from "../api/baseAPI";
import { getToken } from "../utils/jwtToken";


export const scheduleAPI = createApi({
  reducerPath: "scheduleAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseAPI}/api/Schedule/`,
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
    getDepartmentSchedules: builder.query<any, { departmenManagerId: number; pageNumber: number; pageSize: number }>({
      query: ({ departmenManagerId, pageNumber, pageSize }) => ({
        url: `DepartmenManager/${departmenManagerId}`,
        params: { pageNumber, pageSize },
      }),
    }),
    getStaffSchedules: builder.query<any, { userId: number; pageNumber: number; pageSize: number }>({
      query: ({ userId, pageNumber, pageSize }) => ({
        url: `ScheduleUser/Staff/${userId}`,
        params: { pageNumber, pageSize },
      }),
    }),
    getListSchedule: builder.query<
      any,
      { pageNumber: number; pageSize: number }
    >({
      query: ({ pageNumber, pageSize }) => {
        return {
          url: ``,
          method: "GET",
          params: {
            pageNumber,
            pageSize,
          },
        };
      },
    }),
    getDetailSchedule: builder.query<any, { idSchedule: number | null }>({
      query: ({ idSchedule }) => {
        return {
          url: `${idSchedule}`,
          method: "GET",
        };
      },
    }),
    createNewSchedule: builder.mutation({
      query: (body: { schedule: Schedule }) => {
        return {
          url: "",
          method: "POST",
          body,
        };
      },
    }),
    updateSchedule: builder.mutation({
      query: ({
        schedule,
        idSchedule,
      }: {
        schedule: Schedule;
        idSchedule: number;
      }) => {
        return {
          url: `${idSchedule}`,
          method: "PUT",
          body: schedule, // Use only schedule as body
        };
      },
    }),
    deleteSchedule: builder.mutation({
      query: (idSchedule: number) => {
        return {
          url: `${idSchedule}`,
          method: "DELETE",
        };
      },
    }),
    assignSchedule: builder.mutation<any, { 
      title: string;
      description: string;
      note: string;
      deadlineTime: string;
      scheduleId: number;
      assignToId: number;
      assignFromId: number;
    }>({
      query: (body) => ({
        url: "AssignSchedule",
        method: "POST",
        body,
      }),
    }),
  }),
});

// Export the auto-generated hooks for the queries and mutations
export const {
  useGetDepartmentSchedulesQuery,
  useGetStaffSchedulesQuery,
  useGetListScheduleQuery,
  useGetDetailScheduleQuery,
  useCreateNewScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
  useAssignScheduleMutation,
} = scheduleAPI;
