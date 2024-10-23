import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";

export const visitorAPI = createApi({
  reducerPath: "visitorAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseAPI}/api/Visitor`,
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
   createVisitor: builder.mutation<void, { 
      visitorName: string; 
      companyName: string; 
      phoneNumber: string; 
      credentialsCard: string; 
      credentialCardTypeId: number; 
      visitorCredentialImageFromRequest: File 
    }>({
      query: (newVisitor) => {
        const formData = new FormData();
        formData.append("VisitorName", newVisitor.visitorName);
        formData.append("CompanyName", newVisitor.companyName);
        formData.append("PhoneNumber", newVisitor.phoneNumber);
        formData.append("CredentialsCard", newVisitor.credentialsCard);
        formData.append("CredentialCardTypeId", newVisitor.credentialCardTypeId.toString());

        // Đảm bảo file tồn tại
        if (newVisitor.visitorCredentialImageFromRequest) {
          formData.append("VisitorCredentialImageFromRequest", newVisitor.visitorCredentialImageFromRequest, newVisitor.visitorCredentialImageFromRequest.name);
        } else {
          console.error("Không có file hình ảnh nào được chọn.");
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
} = visitorAPI;
