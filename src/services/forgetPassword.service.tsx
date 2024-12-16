import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";

export const passwordAPI = createApi({
  reducerPath: "passwordAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseAPI}/api/User`,
  }),
  endpoints: (builder) => ({
    forgetPasswordUser: builder.mutation<any, { email: string }>({
      query: ({ email }) => ({
        url: `/User/OTP`,
        method: "POST",
        params: {
          email: email,
        },
      }),
    }),
    confirmOTP: builder.mutation<any, { email: string; OTP: string }>({
      query: ({ email, OTP }) => ({
        url: `/User/ConfirmOTP`,
        method: "POST",
        params: {
          email: email,
          OTP: OTP,
        },
      }),
    }),
    setNewPassword: builder.mutation<
      any,
      { email: string; OTP: string; newPassword: string }
    >({
      query: ({ email, OTP, newPassword }) => ({
        url: `/User/SetNewPassword`,
        method: "POST",
        params: {
          email: email,
          OTP: OTP,
          password: newPassword,
        },
      }),
    }),
  }),
});

export const {
  useForgetPasswordUserMutation,
  useConfirmOTPMutation,
  useSetNewPasswordMutation,
} = passwordAPI;
