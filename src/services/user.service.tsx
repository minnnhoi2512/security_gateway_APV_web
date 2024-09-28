import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";

export const userAPI = createApi({
  reducerPath: "userAPI",
  baseQuery: fetchBaseQuery({ baseUrl: `${baseAPI}/api/User/` }),
  endpoints: (builder) => ({
    loginUser: builder.mutation({
      query: (body: { username: string; password: string }) => {
        return {
          url: "Login", 
          method: "POST",
          body,
        };
      },
    }),
  }),
});

export const { useLoginUserMutation } = userAPI;


