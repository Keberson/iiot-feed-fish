import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { prepareHeaders } from "#core/functions/prepareHeaders/prepareHeader";

import type { ISystemSettings, ISystemSettingsForm, ISystemStatus } from "#types/system.type";

import { logsApi } from "./logs";

export const systemApi = createApi({
    reducerPath: "systemApi",
    tagTypes: ["Settings"],
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/system`,
        prepareHeaders,
    }),
    endpoints: (builder) => ({
        getSystemStatus: builder.query<ISystemStatus, void>({
            query: () => `/status`,
        }),
        getSystemSettings: builder.query<ISystemSettings, void>({
            query: () => `/settings`,
            providesTags: ["Settings"],
        }),
        updateSystemSettings: builder.mutation<ISystemSettings, ISystemSettingsForm>({
            query: (body) => ({
                url: `/settings`,
                method: "PUT",
                body: {
                    wifi_ssid: body.wifiSsid,
                    wifi_password: body.wifiPassword,
                },
            }),
            invalidatesTags: ["Settings"],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                await queryFulfilled;
                dispatch(logsApi.util.invalidateTags(["Logs"]));
            },
        }),
    }),
});

export const {
    useGetSystemStatusQuery,
    useGetSystemSettingsQuery,
    useUpdateSystemSettingsMutation,
} = systemApi;
