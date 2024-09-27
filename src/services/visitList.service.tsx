import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";

export const visitListAPI = createApi({
  reducerPath: "visitListAPI",
  baseQuery: fetchBaseQuery({ baseUrl: `${baseAPI}/api/Visit/` }),
  endpoints: (builder) => ({
    getListVisit: builder.query<any, { pageNumber: number; pageSize: number }>({
      query: ({ pageNumber, pageSize }) => {
        return {
          url: "GetAllPaging",
          method: "GET",
          params: {
            pageNumber,
            pageSize,
          },
        };
      },
    }),
  }),
});

// Export the auto-generated hook for the query
export const { useGetListVisitQuery } = visitListAPI;
