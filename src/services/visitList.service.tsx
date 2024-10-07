import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";
import { getToken } from "../utils/jwtToken";

export const visitListAPI = createApi({
  reducerPath: "visitListAPI",
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
    getListVisit: builder.query<any, { pageNumber: number; pageSize: number }>({
      query: ({ pageNumber, pageSize }) => {
        return {
          url: "",
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
