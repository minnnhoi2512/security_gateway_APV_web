import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";


export const departmentAPI = createApi({
  reducerPath: "departmentAPI",
  baseQuery: fetchBaseQuery({ baseUrl: `${baseAPI}/api/Department/` }),
  endpoints: (builder) => ({

    getListDepartments: builder.query<any, { pageNumber: number; pageSize: number }>({
      query: ({ pageNumber, pageSize }) => ({
        url: "",
        method: "GET",
        params: { pageNumber, pageSize },
      }),
    }),

    createDepartment: builder.mutation<void, { departmentName: string; description: string; acceptLevel: number }>({
      query: (newDepartment) => ({
        url: "",  
        method: "POST",
        body: newDepartment,
      }),
    }),
    updateDepartment: builder.mutation<void, { id: number; departmentName: string; description: string; acceptLevel: number }>({
      query: ({ id, ...updatedDepartment }) => ({
        url: `${id}`,  
        method: "PUT",
        body: updatedDepartment,
      }),
    }),
    deleteDepartment: builder.mutation<void, { id: number }>({
      query: ({ id }) => ({
        url: `${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const { useGetListDepartmentsQuery, useCreateDepartmentMutation, useUpdateDepartmentMutation, useDeleteDepartmentMutation, } = departmentAPI;
