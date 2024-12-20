import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";
import Visitor from "../types/visitorType";
import { getToken } from "../utils/jwtToken";

export const visitorAPI = createApi({
  reducerPath: "visitorAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseAPI}/api/Visitor`,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getAllVisitors: builder.query<
      any,
      { pageNumber: number; pageSize: number }
    >({
      query: ({ pageNumber, pageSize }) => ({
        url: "",
        method: "GET",
        params: { pageNumber, pageSize },
      }),
    }),
    getVisitorById: builder.query<any, { id: number }>({
      query: ({ id }) => ({
        url: `${id}`,
        method: "GET",
      }),
    }),
    createVisitor: builder.mutation<
      void,
      {
        visitorName: string;
        companyName: string;
        phoneNumber: string;
        credentialsCard: string;
        email: string;
        imgBlur: File | null;
        credentialCardTypeId: number;
        visitorCredentialFrontImageFromRequest: File | null;
        visitorCredentialBackImageFromRequest: File | null;
      }
    >({
      query: (newVisitor) => {
        const formData = new FormData();

        formData.append("visitorName", newVisitor.visitorName);
        formData.append("companyName", newVisitor.companyName);
        formData.append("email", newVisitor.email);

        formData.append("phoneNumber", newVisitor.phoneNumber);
        formData.append("credentialsCard", newVisitor.credentialsCard);
        formData.append(
          "credentialCardTypeId",
          newVisitor.credentialCardTypeId.toString()
        );
        formData.append(
          "visitorCredentialBlurImageFromRequest",
          newVisitor.imgBlur
        );
        if (newVisitor.visitorCredentialFrontImageFromRequest) {
          formData.append(
            "visitorCredentialFrontImageFromRequest",
            newVisitor.visitorCredentialFrontImageFromRequest
          );
        }
        if (newVisitor.visitorCredentialBackImageFromRequest) {
          formData.append(
            "visitorCredentialBackImageFromRequest",
            newVisitor.visitorCredentialBackImageFromRequest
          );
        }
        return {
          url: "/", // Ensure this matches the endpoint
          method: "POST",
          body: formData,
        };
      },
    }),

    updateVisitor: builder.mutation<
      void,
      {
        id: number;
        visitorName: string;
        companyName: string;
        phoneNumber: string;
        credentialsCard: string;
        email: string;
        credentialCardTypeId: number;
        visitorCredentialFrontImageFromRequest: string;
        visitorCredentialBackImageFromRequest: string;
        visitorCredentialBlurImageFromRequest: string;
      }
    >({
      query: ({ id, ...updatedVisitor }) => {
        const formData = new FormData();
        // console.log(updatedVisitor.visitorCredentialBlurImageFromRequest.toString())
        formData.append("visitorName", updatedVisitor.visitorName);
        formData.append("companyName", updatedVisitor.companyName);
        formData.append("email", updatedVisitor.email);
        formData.append("phoneNumber", updatedVisitor.phoneNumber);
        formData.append("credentialsCard", updatedVisitor.credentialsCard);
        formData.append(
          "credentialCardTypeId",
          updatedVisitor.credentialCardTypeId.toString()
        );
        formData.append(
          "visitorCredentialFrontImageFromRequest",
          updatedVisitor.visitorCredentialFrontImageFromRequest.toString()
        );
        formData.append(
          "visitorCredentialBlurImageFromRequest",
          updatedVisitor.visitorCredentialBlurImageFromRequest.toString()
        );
        formData.append(
          "visitorCredentialBackImageFromRequest",
          updatedVisitor.visitorCredentialBackImageFromRequest.toString()
        );

        return {
          url: `/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      extraOptions: {
        skipDefaultHeaders: true,
      },
    }),
    deleteVisitor: builder.mutation<void, { id: number }>({
      query: ({ id }) => ({
        url: `${id}`,
        method: "DELETE",
      }),
    }),
    getVisitorByCredentialCard: builder.query<any, { CredentialCard: string }>({
      query: ({ CredentialCard }) => ({
        url: `/CredentialCard/${CredentialCard}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetAllVisitorsQuery,
  useCreateVisitorMutation,
  useUpdateVisitorMutation,
  useDeleteVisitorMutation,
  useGetVisitorByCredentialCardQuery,
  useGetVisitorByIdQuery,
} = visitorAPI;
