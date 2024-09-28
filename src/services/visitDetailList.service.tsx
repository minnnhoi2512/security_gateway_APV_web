import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";
import VisitDetailList from "../types/visitDetailListType";

export const visitDetailListAPI = createApi({
  reducerPath: "visitDetailListAPI",
  baseQuery: fetchBaseQuery({ baseUrl: `${baseAPI}/api/Visit/` }),
  endpoints: (builder) => ({
    getListDetailVisit: builder.query<any, { visitId: number }>({
      query: ({ visitId }) => {
        return {
          url: `GetVisitDetailByVisitId/${visitId}`,
          method: "GET",
        };
      },
    }),
    createNewListDetailVisit: builder.mutation<
      VisitDetailList,
      { newVisitDetailList: VisitDetailList }>({
      query: ({ newVisitDetailList }) => {
        return {
          url: `CreateVisit`,
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
} = visitDetailListAPI;
