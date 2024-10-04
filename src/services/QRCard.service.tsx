import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";

export const qrCardAPI = createApi({
  reducerPath: "qrCardAPI",
  baseQuery: fetchBaseQuery({ baseUrl: `${baseAPI}/api/QRCode/` }),
  endpoints: (builder) => ({
    getListQRCard: builder.query<any, { pageNumber: number; pageSize: number }>({
      query: ({ pageNumber, pageSize }) => ({
        url: "GetAllQrCardPaging",
        method: "GET",
        params: { pageNumber, pageSize },
      }),
    }),
    createQRCard: builder.mutation<void, string>({
      query: (cardGuid) => ({
        url: `CreateQRCard?cardGuid=${cardGuid}`,
        method: "POST",
      }),
    }),
    generateQRCard: builder.mutation<void, string>({
      query: (cardGuid) => ({
        url: `GenerateQrCar?cardGuid=${cardGuid}`,
        method: "POST",
      }),
    }),
  }),
});


export const { useGetListQRCardQuery, useCreateQRCardMutation, useGenerateQRCardMutation } = qrCardAPI;
