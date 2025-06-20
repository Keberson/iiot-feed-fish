import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
    IFeedingCreateEditRequest,
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
        getFeedingList: builder.query<IFeedingList, IOptionalPaginationRequest>({
            query: (pagination) =>
                pagination
                    ? `?current=${pagination.current}&itemsPerPage=${pagination.itemsPerPage}`
                    : "",
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
} = feedingApi;
