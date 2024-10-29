import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";
import GraphqlQueryType from "../types/graphqlQueryType";
import { getToken } from "../utils/jwtToken";
import GrapqlResponseType from "../types/graphqlResponseType";

export const visitGrapqlAPI = createApi({
  reducerPath: "visitGraphqlAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseAPI}/graphql`,
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
    getVisitGraphql: builder.mutation<
    GrapqlResponseType,
      { query: GraphqlQueryType }
    >({
      query: ({ query }) => {
        return {
          url: "",
          method: "POST",
          body: query, // Include the body in the request
        };
      },
    }),
  }),
});

// Export the auto-generated hook for the query
export const {
  useGetVisitGraphqlMutation,
} = visitGrapqlAPI;
