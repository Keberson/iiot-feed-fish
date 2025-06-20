import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
    IFeedingCreateEditRequest,
    IFeedingFilter,
    IFeedingFormDataResponse,
    IFeedingItem,
    IFeedingList,
} from "#types/feeding.types";

import type { AuthState } from "#store/auth.slice";
import type { IOptionalPaginationRequest } from "#types/api.types";

export const feedingApi = createApi({
    reducerPath: "feedingApi",
    tagTypes: ["FeedingItem"],
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.FRONT_API_URL || "http://localhost:4000/api"}/feeding`,
        prepareHeaders: (headers: Headers, { getState }: { getState: () => unknown }) => {
            headers.set(
                "Authorization",
                `Bearer ${(getState() as { auth: AuthState }).auth.session?.token}`
            );
        },
    }),
    endpoints: (builder) => ({
        getFeedingFormData: builder.query<IFeedingFormDataResponse, void>({
            query: () => "/form-data",
        }),
        createFeeding: builder.mutation<IFeedingItem, IFeedingCreateEditRequest>({
            query: (body) => ({ url: ``, method: "POST", body }),
            invalidatesTags: [{ type: "FeedingItem", id: "PARTIAL-LIST" }],
        }),
        getFeedingList: builder.query<
            IFeedingList,
            { pagination?: IOptionalPaginationRequest; filter?: IFeedingFilter } | undefined
        >({
            query: (params) => {
                if (!params) {
                    return "";
                }

                const searchParams = new URLSearchParams();
                const pagination = params.pagination;
                const filter = params.filter;

                if (pagination) {
                    searchParams.set("current", String(pagination.current));
                    searchParams.set("itemsPerPage", String(pagination.itemsPerPage));
                }

                if (filter && filter.feed) {
                    searchParams.set("feed", filter.feed);
                }

                if (filter && filter.pool) {
                    searchParams.set("pool", filter.pool);
                }

                if (filter && filter.minWeight) {
                    searchParams.set("min-weight", filter.minWeight.toString());
                }

                if (filter && filter.maxWeight) {
                    searchParams.set("max-weight", filter.maxWeight.toString());
                }

                return `?${searchParams.toString()}`;
            },
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
} = feedingApi;
