import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";

export const qrCardAPI = createApi({
  reducerPath: "qrCardAPI",
  baseQuery: fetchBaseQuery({ baseUrl: `${baseAPI}/api/QRCode/` }),
  endpoints: (builder) => ({
    getQrCards: builder.query({
      query: ({ pageNumber, pageSize }) => ({
        url: `GetAllQrCardPaging?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetQrCardsQuery } = qrCardAPI;
