import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { prepareHeaders } from "#core/functions/prepareHeaders/prepareHeader";

import type { ISystemStatus } from "#types/system.type";

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
    }),
});

export const { useGetSystemStatusQuery } = systemApi;
