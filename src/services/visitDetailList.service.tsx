import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";

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
  }),
});

// Export the auto-generated hook for the query
export const { useGetListDetailVisitQuery } = visitDetailListAPI;
