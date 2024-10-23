import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";
import User from "../types/userType";
import { getToken } from "../utils/jwtToken";

export const userAPI = createApi({
  reducerPath: "userAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseAPI}/api/User`,
    prepareHeaders: (headers, { endpoint }) => {
      // Add the token for all requests except the 'loginUser' mutation
      if (endpoint !== 'loginUser') {
        const token = getToken();
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
      headers.set("Content-Type", "application/json"); // Default content type
      return headers;
    },
  }),
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
    getListUserByRole: builder.query<
      any,
      { pageNumber: number; pageSize: number; role: string }
    >({
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
    getListUsersByDepartmentId: builder.query<
      any,
      { departmentId: number; pageNumber: number; pageSize: number }
    >({
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
    getListStaffByDepartmentManager: builder.query<
      any,
      { departmentManagerId: number; pageNumber: number; pageSize: number }
    >({
      query: ({ departmentManagerId, pageNumber, pageSize }) => {
        return {
          url: `Staff/DepartmentManager/${departmentManagerId}`,
          method: "GET",
          params: {
            pageNumber,
            pageSize,
          },
        };
      },
    }),
    createNewUser: builder.mutation({
      query: (User: User) => {
        return {
          url: "",
          method: "POST",
          body: User,
        };
      },
    }),
    updateUser: builder.mutation({
      query: ({ User, idUser }: { User: User; idUser: number | null }) => {
        return {
          url: `/${idUser}`,
          method: "PUT",
          body: User,
        };
      },
    }),
    deleteUser: builder.mutation({
      query: (idUser: number) => {
        return {
          url: `/${idUser}`,
          method: "DELETE",
        };
      },
    }),
    getDetailUser: builder.query({
      query: (idUser: number) => {
        return {
          url: `/${idUser}`,
          method: "GET",
        };
      },
    }),
  }),
});

export const {
  useLoginUserMutation,
  useGetListUserByRoleQuery,
  useGetListStaffByDepartmentManagerQuery,
  useCreateNewUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetListUsersByDepartmentIdQuery,
  useGetDetailUserQuery
} = userAPI;
