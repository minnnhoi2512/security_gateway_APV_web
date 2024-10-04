import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";
import User from "../types/userType";

export const userAPI = createApi({
  reducerPath: "userAPI",
  baseQuery: fetchBaseQuery({ baseUrl: `${baseAPI}/api/User` }),
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
          // url: `/Staff/DepartmentManager/${id}`,
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
          // url: `/Staff/DepartmentManager/${id}`,
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
} = userAPI;
