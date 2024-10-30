import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";
import VisitDetailList from "../types/visitDetailListType";
import { getToken } from "../utils/jwtToken";

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
  }),
});

// Export the auto-generated hook for the query
export const {
  useGetListDetailVisitQuery,
  useCreateNewListDetailVisitMutation,
  useCreateNewScheduleVisitMutation,
  useGetDetailVisitQuery,
  useUpdateVisitBeforeStartDateMutation,
  useUpdateVisitAfterStartDateMutation
} = visitDetailListAPI;
