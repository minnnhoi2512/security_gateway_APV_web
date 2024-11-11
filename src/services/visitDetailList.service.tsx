import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";
import { getToken } from "../utils/jwtToken";
import VisitDetailList from "../types/visitDetailListType";

export const visitDetailListAPI = createApi({
  reducerPath: "visitDetailListAPI",
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
    getDetailVisit: builder.query<any, { visitId: number }>({
      query: ({ visitId }) => {
        return {
          url: `${visitId}`,
          method: "GET",
        };
      },
    }),
    getListDetailVisit: builder.query<
      any,
      { visitId: number; pageSize: number; pageNumber: number }
    >({
      query: ({ visitId, pageSize, pageNumber }) => {
        return {
          url: `VisitDetail/${visitId}`,
          method: "GET",
          params: {
            pageNumber,
            pageSize,
          },
        };
      },
    }),
    createNewListDetailVisit: builder.mutation<
      VisitDetailList,
      { newVisitDetailList: VisitDetailList }
    >({
      query: ({ newVisitDetailList }) => {
        return {
          url: "/Daily",
          method: "POST",
          body: newVisitDetailList, // Include the body in the request
        };
      },
    }),
    createNewScheduleVisit: builder.mutation<
      VisitDetailList,
      { newVisitDetailList: VisitDetailList }
    >({
      query: ({ newVisitDetailList }) => {
        return {
          url: "/",
          method: "POST",
          body: newVisitDetailList, // Include the body in the request
        };
      },
    }),
    updateVisitBeforeStartDate: builder.mutation<
      number, // The type of the response
      { visitId: number; updateVisit: any } // Input parameters
    >({
      query: ({ visitId, updateVisit }) => ({
        url: `BeforeStartDate/${visitId}`, // Construct the URL using the ID
        method: "PUT",
        body: updateVisit, // Include the body in the request
      }),
    }),
    updateVisitAfterStartDate: builder.mutation<
      number, // The type of the response
      { visitId: number; updateVisit: any } // Input parameters
    >({
      query: ({ visitId, updateVisit }) => ({
        url: `AfterStartDate/${visitId}`, // Construct the URL using the ID
        method: "PUT",
        body: updateVisit, // Include the body in the request
      }),
    }),
    appendVisitAfterStartDate: builder.mutation<
      number, // The type of the response
      { visitId: number; expectedEndTime : Date, updateById : number } // Input parameters
    >({
      query: ({ visitId, expectedEndTime, updateById}) => ({
        url: `AppendTime/${visitId}`, // Construct the URL using the ID
        method: "PUT",
        body: {
          expectedEndTime,
          updateById
        }, // Include the body in the request
      }),
    }),
    updateStatusVisit: builder.mutation<
      number, // The type of the response
      { visitId: number; action : String } // Input parameters
    >({
      query: ({ visitId, action}) => ({
        url: `Status/${visitId}`, // Construct the URL using the ID
        method: "PUT",
        params: {
          action
        }, 
      }),
    }),
  }),
});

// Export the auto-generated hook for the query
export const {
  useGetListDetailVisitQuery,
  useCreateNewListDetailVisitMutation,
  useCreateNewScheduleVisitMutation,
  useGetDetailVisitQuery,
  useUpdateVisitBeforeStartDateMutation,
  useUpdateVisitAfterStartDateMutation,
  useAppendVisitAfterStartDateMutation,
  useUpdateStatusVisitMutation,
} = visitDetailListAPI;
