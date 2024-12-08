import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";

interface DailyCount {
  day: number;
  count: number;
}

interface VisitorSessionMonthParams {
  year: number;
  month: number;
}

interface VisitorSessionMonthResponse {
  dailyCounts: DailyCount[];
}

export const dashBoardAPI = createApi({
  reducerPath: "dashBoardAPI",
  baseQuery: fetchBaseQuery({ baseUrl: `${baseAPI}/api/Dashboard` }),
  endpoints: (builder) => ({
    getDashboardVisit: builder.query<any, any>({
      query: () => ({
        url: "Visit",
        method: "GET",
      }),
    }),
    getDashboardUser: builder.query<any, any>({
      query: () => ({
        url: "User",
        method: "GET",
      }),
    }),
    getDashboardVisitor: builder.query<any, any>({
      query: () => ({
        url: "Visitor",
        method: "GET",
      }),
    }),
    getDashboardSchedule: builder.query<any, any>({
      query: () => ({
        url: "Schedule",
        method: "GET",
      }),
    }),
    getDashboardVisitorSessionStatusToday: builder.query<any, any>({
      query: () => ({
        url: "VisitorSessionStatusToday",
        method: "GET",
      }),
    }),
    getDashboardCardStatus: builder.query<any, any>({
      query: () => ({
        url: "CardStatusCount",
        method: "GET",
      }),
    }),
    getDashboardCardIssues: builder.query<any, any>({
      query: () => ({
        url: "GetCardCountByIssue",
        method: "GET",
      }),
    }),
    getDashboardVisitorSSYear: builder.query<any, any>({
      query: () => ({
        url: "VisitorSessionYear?year=2024",
        method: "GET",
      }),
    }),
    getDashboardVisitorSessionMonth: builder.query<VisitorSessionMonthResponse, VisitorSessionMonthParams>({
      query: (params) => ({
        url: `VisitorSessionMonth`,
        params: { year: params.year, month: params.month }
      }),
    }),
    
  }),
});

export const {
  useGetDashboardVisitQuery,
  useGetDashboardUserQuery,
  useGetDashboardVisitorQuery,
  useGetDashboardScheduleQuery,
  useGetDashboardVisitorSessionStatusTodayQuery,
  useGetDashboardCardStatusQuery,
  useGetDashboardCardIssuesQuery,
  useGetDashboardVisitorSSYearQuery,
  useGetDashboardVisitorSessionMonthQuery,
} = dashBoardAPI;
