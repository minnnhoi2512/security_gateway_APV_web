import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";

export const processAPI = createApi({
  reducerPath: "processAPI",
  baseQuery: fetchBaseQuery({ baseUrl: `${baseAPI}/api/Process/` }),
  endpoints: (builder) => ({
    getListProcess: builder.query<any, { departmentManagerId: number }>({
      query: ({ departmentManagerId }) => {
        return {
          url: `GetAllProcessByDepartmentmanagerId/${departmentManagerId}`,
          method: "GET",
        };
      },
    }),
    // getListVisit: builder.query<any, { departmentManagerId: number }>({
    //     query: ({ departmentManagerId }) => {
    //       return {
    //         url: "GetAllProcessByDepartmentmanagerId",
    //         method: "GET",
    //         params: {
    //           departmentManagerId
    //         },
    //       };
    //     },
    //   }),
  }),
});

// Export the auto-generated hook for the query
export const { useGetListProcessQuery } = processAPI;
