import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";
import Gate from "../types/gateType";
import CameraType from "../types/cameraType";

export const gateAPI = createApi({
  reducerPath: "gateAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseAPI}/api/Gate`,
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getListGate: builder.query<any, any>({
      query: () => ({
        url: "GetAllGatePaging?pageSize=100&pageNumber=1",
        method: "GET",
      }),
    }),
    getListCameraType: builder.query<any, any>({
      query: () => ({
        url: "CameraType",
        method: "GET",
      }),
    }),
    getCameraById: builder.query<any, { gateId: number }>({
      query: ({ gateId }) => ({
        url: `${gateId}`,
        method: "GET",
      }),
    }),
    createGate: builder.mutation<void, { gate: Gate }>({
      query: ({ gate }) => ({
        url: "",
        method: "POST",
        body: gate,
      }),
    }),
    updateGate: builder.mutation<void, { gate: Gate }>({
      query: ({ gate }) => ({
        url: "",
        method: "PUT",
        body: gate,
      }),
    }),
  }),
});

export const {
  useGetListGateQuery,
  useGetListCameraTypeQuery,
  useCreateGateMutation,
  useUpdateGateMutation,
  useGetCameraByIdQuery,
} = gateAPI;
