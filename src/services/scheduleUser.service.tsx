import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseAPI from "../api/baseAPI";
import { getToken } from "../utils/jwtToken";

export const scheduleUserAPI = createApi({
    reducerPath: "userScheduyeAPI",
    baseQuery: fetchBaseQuery({
        baseUrl: `${baseAPI}/api/ScheduleUser/`,
        prepareHeaders: (headers) => {
            const token = getToken();
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            headers.set("Content-Type", "application/json");
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getSchedulesUserByStatus: builder.query<
            any,
            { userId: number; status: string; pageNumber: number; pageSize: number }
        >({
            query: ({ userId, status, pageNumber, pageSize }) => ({
                url: `Status/${status}/UserId/${userId}`,
                params: { pageNumber, pageSize },
            }),
        }),
        assignSchedule: builder.mutation<
            any,
            {
                title: string;
                description: string;
                note: string;
                deadlineTime: string;
                scheduleId: number;
                assignToId: number;
            }
        >({
            query: (body) => ({
                url: "",
                method: "POST",
                body,
            }),
        }),
    }),
});


export const { useGetSchedulesUserByStatusQuery, useAssignScheduleMutation } = scheduleUserAPI;