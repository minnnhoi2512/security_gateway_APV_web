import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";

export const visitorAPI = createApi({
  reducerPath: "visitorAPI",
  baseQuery: fetchBaseQuery({ baseUrl: `${baseAPI}/api/Visitor` }),
  endpoints: (builder) => ({
    getAllVisitors: builder.query<any, { pageNumber: number; pageSize: number }>({
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
          url: "/",
          method: "POST",
          body: formData,
        };
      },
    }),

    updateVisitor: builder.mutation<void, { 
      id: number; 
      visitorName: string; 
      companyName: string; 
      phoneNumber: string; 
      credentialsCard: string; 
      credentialCardTypeId: number; 
      visitorCredentialImageFromRequest?: File 
    }>({
      query: ({ id, ...updatedVisitor }) => {
        const formData = new FormData();
    
        formData.append("VisitorName", updatedVisitor.visitorName);
        formData.append("CompanyName", updatedVisitor.companyName);
        formData.append("PhoneNumber", updatedVisitor.phoneNumber);
        formData.append("CredentialsCard", updatedVisitor.credentialsCard);
        formData.append("CredentialCardTypeId", updatedVisitor.credentialCardTypeId.toString());
    
        // Handle file upload, but check if the file exists
        if (updatedVisitor.visitorCredentialImageFromRequest) {
          formData.append(
            "VisitorCredentialImageFromRequest",
            updatedVisitor.visitorCredentialImageFromRequest,
            updatedVisitor.visitorCredentialImageFromRequest.name
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
  }),
});

export const { 
  useGetAllVisitorsQuery, 
  useCreateVisitorMutation, 
  useUpdateVisitorMutation, 
  useDeleteVisitorMutation 
} = visitorAPI;
