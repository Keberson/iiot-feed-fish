import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { prepareHeaders } from "#core/functions/prepareHeaders/prepareHeader";

import type { IOptionalPaginationRequest } from "#types/api.types";
import type { ILogFilter, ILogList, ILogTable } from "#types/log.types";

export const logsApi = createApi({
    reducerPath: "logsApi",
    tagTypes: ["LogItem"],
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/logs`,
        prepareHeaders,
    }),
    endpoints: (builder) => ({
        getLogsList: builder.query<
            ILogTable,
            { pagination?: IOptionalPaginationRequest; filter?: ILogFilter } | undefined
        >({
            query: (params) => ({
                url: "",
                params: {
                    ...params?.pagination,
                    type: params?.filter?.type,
                    dateMin:
                        params?.filter?.dates && params.filter.dates[0] !== ""
                            ? params.filter.dates[0]
                            : undefined,
                    dateMax:
                        params?.filter?.dates && params.filter.dates[1] !== ""
                            ? params.filter.dates[1]
                            : undefined,
                },
            }),
            providesTags: (result) => [
                ...(result?.data || []).map(({ id }) => ({
                    type: "LogItem" as const,
                    id,
                })),
                { type: "LogItem", id: "PARTIAL-LIST" },
            ],
            transformResponse: (response: ILogList) => ({
                ...response,
                data: response.data.map((item) => ({
                    id: item.uuid,
                    action: item.action,
                    when: item.when,
                    description: item.description,
                    type: item.type,
                })),
            }),
        }),
    }),
});

export const { useGetLogsListQuery } = logsApi;
