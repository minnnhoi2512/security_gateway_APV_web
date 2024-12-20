import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";
import { getToken } from "../utils/jwtToken";

interface DailyCount {
  day: number;
  count: number;
}

interface VisitorSessionMonthParams {
  year: number;
  month: number;
}
interface MonthlyCount {
  month: number;
  count: number;
}

interface VisitorSessionMonthResponse {
  monthlyCounts: MonthlyCount[];
  dailyCounts: DailyCount[];
}

export const dashBoardAPI = createApi({
  reducerPath: "dashBoardAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseAPI}/api/Dashboard`,
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
    getDashboardVisitorSSYear: builder.query<any, { year: number }>({
      query: (year) => ({
        url: `VisitorSessionYear`,
        method: "GET",
        params: { year: year.year },
      }),
    }),
    getDashboardVisitorSessionMonth: builder.query<
      VisitorSessionMonthResponse,
      VisitorSessionMonthParams
    >({
      query: (params) => ({
        url: `VisitorSessionMonth`,
        params: { year: params.year, month: params.month },
      }),
    }),
    getRecentSession: builder.query<any, any>({
      query: () => ({
        url: "RecentVisitorSessions?count=5",
        method: "GET",
      }),
    }),
    getTask: builder.query<any, any>({
      query: () => ({
        url: "ScheduleUser",
        method: "GET",
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
  useGetRecentSessionQuery,
  useGetTaskQuery,
} = dashBoardAPI;
