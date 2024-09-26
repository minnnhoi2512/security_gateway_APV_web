import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";

export const userAPI = createApi({
  reducerPath: "userAPI",
  baseQuery: fetchBaseQuery({ baseUrl: `${baseAPI}/api/User/` }),
  endpoints: (builder) => ({
    loginUser: builder.mutation({
      query: (body: { email: string; password: string }) => {
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




// import { createApi, BaseQueryFn } from '@reduxjs/toolkit/query/react';
// import { AxiosError, AxiosRequestConfig } from 'axios';
// import { axiosClient } from '../api/axiosAPI';

// // Define a custom base query using Axios
// const axiosBaseQuery =
//   (): BaseQueryFn<
//     { url: string; method: AxiosRequestConfig['method']; data?: any },
//     unknown,
//     unknown
//   > =>
//   async ({ url, method, data }) => {
//     try {
//       const result = await axiosClient({ url, method, data });
//       return { data: result.data };
//     } catch (axiosError) {
//       let err = axiosError as AxiosError;
//       return {
//         error: {
//           status: err.response?.status,
//           data: err.response?.data || err.message,
//         },
//       };
//     }
//   };

// // Create the API using the custom Axios baseQuery
// export const userAPI = createApi({
//   reducerPath: 'userAPI',
//   baseQuery: axiosBaseQuery(),
//   endpoints: (builder) => ({
//     loginUser: builder.mutation({
//       query: (body: { email: string; password: string }) => ({
//         url: '/api/User/Login',
//         method: 'POST',
//         data: body, // Axios uses `data` instead of `body`
//       }),
//     }),
//   }),
// });

// export const { useLoginUserMutation } = userAPI;

