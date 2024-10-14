import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";
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
      headers.set("Content-Type", "application/json"); // Default content type
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
    createVisitor: builder.mutation<
      void,
      {
        visitorName: string;
        companyName: string;
        phoneNumber: string;
        credentialsCard: string;
        credentialCardTypeId: number;
        visitorCredentialImageFromRequest: File;
      }
    >({
      query: (newVisitor) => {
        const formData = new FormData();
        formData.append("visitorName", newVisitor.visitorName);
        formData.append("companyName", newVisitor.companyName);
        formData.append("phoneNumber", newVisitor.phoneNumber);
        formData.append("credentialsCard", newVisitor.credentialsCard);
        formData.append(
          "credentialCardTypeId",
          newVisitor.credentialCardTypeId.toString()
        );
        console.log(
          "Selected file: ",
          newVisitor.visitorCredentialImageFromRequest
        );
        formData.append(
          "visitorCredentialImageFromRequest",
          newVisitor.visitorCredentialImageFromRequest,
          newVisitor.visitorCredentialImageFromRequest.name
        );

        return {
          url: "/",
          method: "POST",
          data: formData,
          headers: { "Content-Type": "multipart/form-data" },
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
        credentialCardTypeId: number;
        visitorCredentialImageFromRequest?: File;
      }
    >({
      query: ({ id, ...updatedVisitor }) => {
        const formData = new FormData();
        formData.append("visitorName", updatedVisitor.visitorName);
        formData.append("companyName", updatedVisitor.companyName);
        formData.append("phoneNumber", updatedVisitor.phoneNumber);
        formData.append("credentialsCard", updatedVisitor.credentialsCard);
        formData.append(
          "credentialCardTypeId",
          updatedVisitor.credentialCardTypeId.toString()
        );

        // Nếu có hình ảnh, thêm vào `FormData`
        if (updatedVisitor.visitorCredentialImageFromRequest) {
          formData.append(
            "visitorCredentialImageFromRequest",
            updatedVisitor.visitorCredentialImageFromRequest
          );
        }

        return {
          url: `/${id}`,
          method: "PUT",
          body: formData,
        };
      },
    }),
    deleteVisitor: builder.mutation<void, { id: number }>({
      query: ({ id }) => ({
        url: `${id}`,
        method: "DELETE",
      }),
    }),
    getVisitorByCredentialCard: builder.query<any, { CredentialCard: string }>(
      {
        query: ({ CredentialCard }) => ({
          url: `/CredentialCard/${CredentialCard}`,
          method: "GET",
        }),
      }
    ),
  }),
});

export const {
  useGetAllVisitorsQuery,
  useCreateVisitorMutation,
  useUpdateVisitorMutation,
  useDeleteVisitorMutation,
  useGetVisitorByCredentialCardQuery,
} = visitorAPI;
