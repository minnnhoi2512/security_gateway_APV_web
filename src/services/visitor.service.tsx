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
      query: ({
        visitorName,
        companyName,
        phoneNumber,
        credentialsCard,
        credentialCardTypeId,
        visitorCredentialImageFromRequest,
      }) => {
        const formData = new FormData();
        formData.append("VisitorName", visitorName);
        formData.append("CompanyName", companyName);
        formData.append("PhoneNumber", phoneNumber);
        formData.append("CredentialsCard", credentialsCard);
        formData.append(
          "CredentialCardTypeId",
          credentialCardTypeId.toString()
        );
        formData.append(
          "VisitorCredentialImageFromRequest",
          visitorCredentialImageFromRequest,
          visitorCredentialImageFromRequest.name
        );

        // Log all entries in FormData
        // for (let [key, value] of formData.entries()) {
        //   console.log(key, value);
        // }

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
