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
    getListDetailVisit: builder.query<any, { visitId: number | null }>({
      query: ({ visitId }) => {
        return {
          url: `VisitDetail/${visitId}`,
          method: "GET",
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
  }),
});

// Export the auto-generated hook for the query
export const {
  useGetListDetailVisitQuery,
  useCreateNewListDetailVisitMutation,
  useCreateNewScheduleVisitMutation
} = visitDetailListAPI;
