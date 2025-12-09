import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { prepareHeaders } from "#core/functions/prepareHeaders/prepareHeader";

import type {
    IFeedingCreateEditRequest,
    IFeedingFilter,
    IFeedingFormDataResponse,
    IFeedingItem,
    IFeedingList,
} from "#types/feeding.types";

import type { IOptionalPaginationRequest } from "#types/api.types";

import { logsApi } from "./logs.api";

export const feedingApi = createApi({
    reducerPath: "feedingLogApi",
    tagTypes: ["FeedingItem"],
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/feeding`,
        prepareHeaders,
    }),
    endpoints: (builder) => ({
        getFeedingFormData: builder.query<IFeedingFormDataResponse, void>({
            query: () => "/form-data",
        }),
        createFeeding: builder.mutation<IFeedingItem, IFeedingCreateEditRequest>({
            query: (body) => ({ url: ``, method: "POST", body }),
            invalidatesTags: [{ type: "FeedingItem", id: "PARTIAL-LIST" }],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                await queryFulfilled;
                dispatch(logsApi.util.invalidateTags(["Logs"]));
            },
        }),
        getFeedingList: builder.query<
            IFeedingList,
            { pagination?: IOptionalPaginationRequest; filter?: IFeedingFilter } | undefined
        >({
            query: (params) => ({
                url: "",
                params: {
                    ...params?.filter,
                    ...params?.pagination,
                },
            }),
            providesTags: (result) => [
                ...(result?.data || []).map(({ uuid }) => ({
                    type: "FeedingItem" as const,
                    id: uuid,
                })),
                { type: "FeedingItem", id: "PARTIAL-LIST" },
            ],
        }),
        getFeedingById: builder.query<IFeedingItem, string>({
            query: (id) => `/${id}`,
            providesTags: (_, __, id) => [{ type: "FeedingItem", id }],
        }),
        deleteFeedingById: builder.mutation<void, string>({
            query: (id) => ({ url: `/${id}`, method: "DELETE" }),
            invalidatesTags: (_, __, id) => [
                { type: "FeedingItem", id },
                { type: "FeedingItem", id: "PARTIAL-LIST" },
            ],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                await queryFulfilled;
                dispatch(logsApi.util.invalidateTags(["Logs"]));
            },
        }),
        editFeedingById: builder.mutation<
            IFeedingItem,
            { id: string; body: IFeedingCreateEditRequest }
        >({
            query: ({ id, body }) => ({ url: `/${id}`, method: "PUT", body }),
            invalidatesTags: (_, __, item) => [
                { type: "FeedingItem", id: item.id },
                { type: "FeedingItem", id: "PARTIAL-LIST" },
            ],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                await queryFulfilled;
                dispatch(logsApi.util.invalidateTags(["Logs"]));
            },
        }),
        patchFeedingById: builder.mutation<
            IFeedingItem,
            { id: string; body: Partial<IFeedingCreateEditRequest> }
        >({
            query: ({ id, body }) => ({ url: `/${id}`, method: "PATCH", body }),
            invalidatesTags: (_, __, item) => [
                { type: "FeedingItem", id: item.id },
                { type: "FeedingItem", id: "PARTIAL-LIST" },
            ],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                await queryFulfilled;
                dispatch(logsApi.util.invalidateTags(["Logs"]));
            },
        }),
        downloadCsv: builder.query<void, IFeedingFilter | undefined>({
            query: (filter) => ({
                url: "/export",
                params: {
                    feed: filter?.feed,
                    pool: filter?.pool,
                    "min-weight": filter?.minWeight,
                    "max-weight": filter?.maxWeight,
                },
                method: "GET",
                responseHandler: async (response) => {
                    if (!response.ok) {
                        throw new Error("Ошибка при скачивании");
                    }

                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "data.csv";
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    a.remove();

                    return { success: true };
                },
                cache: "no-cache",
            }),
        }),
    }),
});

export const {
    useGetFeedingFormDataQuery,
    useLazyGetFeedingFormDataQuery,
    useCreateFeedingMutation,
    useGetFeedingListQuery,
    useGetFeedingByIdQuery,
    useDeleteFeedingByIdMutation,
    useEditFeedingByIdMutation,
    usePatchFeedingByIdMutation,
    useLazyDownloadCsvQuery,
} = feedingApi;
