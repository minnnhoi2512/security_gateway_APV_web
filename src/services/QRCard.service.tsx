import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";

export const qrCardAPI = createApi({
  reducerPath: "qrCardAPI",
  baseQuery: fetchBaseQuery({ baseUrl: `${baseAPI}/api/QRCode/` }),
  endpoints: (builder) => ({
    getListQRCard: builder.query<any, { pageNumber: number; pageSize: number }>({
      query: ({ pageNumber, pageSize }) => {
        return {
          url: "GetAllQrCardPaging",
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

// Export the auto-generated hook for the query
export const { useGetListQRCardQuery } = qrCardAPI;
