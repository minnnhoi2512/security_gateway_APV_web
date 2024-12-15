import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";

export const qrCardAPI = createApi({
  reducerPath: "qrCardAPI",
  baseQuery: fetchBaseQuery({ baseUrl: `${baseAPI}/api/` }),
  endpoints: (builder) => ({
    getListQRCard: builder.query<any, { pageNumber: number; pageSize: number }>(
      {
        query: ({ pageNumber, pageSize }) => ({
          url: "Card",
          method: "GET",
          params: { pageNumber, pageSize },
        }),
      }
    ),
    createQRCard: builder.mutation<
      void,
      { CardVerified: string; CardTypeId: number }
    >({
      query: ({ CardVerified, CardTypeId }) => {
        const formData = new FormData();
        formData.append("CardVerified", CardVerified);
        formData.append("CardTypeId", CardTypeId.toString());

        return {
          url: `Card`,
          method: "POST",
          body: formData,
        };
      },
    }),
    generateQRCard: builder.mutation<void, string>({
      query: (cardGuid) => ({
        url: `GenerateQrCar?cardGuid=${cardGuid}`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useGetListQRCardQuery,
  useCreateQRCardMutation,
  useGenerateQRCardMutation,
} = qrCardAPI;
