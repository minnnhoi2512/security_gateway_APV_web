import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Schedule from "../types/scheduleType";
import baseAPI from "../api/baseAPI";

export const scheduleAPI = createApi({
  reducerPath: "scheduleAPI",
  baseQuery: fetchBaseQuery({ baseUrl: `${baseAPI}/api/Schedule/` }),
  endpoints: (builder) => ({
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
  }),
});

// Export the auto-generated hook for the query
export const {
  useGetListScheduleQuery,
  useGetDetailScheduleQuery,
  useCreateNewScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
} = scheduleAPI;
