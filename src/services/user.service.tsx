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
    getListUserByRole: builder.query<any, { pageNumber: number; pageSize: number; role: string }>({
      query: ({ pageNumber, pageSize, role }) => {
        return {
          url: "",
          method: "GET",
          params: {
            pageNumber,
            pageSize,
            role,
          },
        };
      },
    }),
    getListUsersByDepartmentId: builder.query<any, { departmentId: number, pageNumber: number; pageSize: number }>({
      query: ({ departmentId, pageNumber, pageSize }) => {
        return {
          url: `Department/${departmentId}`,
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

export const { useLoginUserMutation,useGetListUserByRoleQuery, useGetListUsersByDepartmentIdQuery } = userAPI;
