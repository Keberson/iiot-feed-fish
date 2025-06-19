import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
    IFeedingCreateEditRequest,
    IFeedingFormDataResponse,
    IFeedingItem,
} from "#types/feeding.types";

import type { AuthState } from "#store/auth.slice";

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
            invalidatesTags: ["FeedingItem"],
        }),
        getFeedingList: builder.query<IFeedingItem[], void>({
            query: () => "",
            providesTags: ["FeedingItem"],
        }),
        getFeedingById: builder.query<IFeedingItem, string>({
            query: (id) => `/${id}`,
        }),
        deleteFeedingById: builder.mutation<void, string>({
            query: (id) => ({ url: `/${id}`, method: "DELETE" }),
            invalidatesTags: ["FeedingItem"],
        }),
        editFeedingById: builder.mutation<
            IFeedingItem,
            { id: string; body: IFeedingCreateEditRequest }
        >({
            query: ({ id, body }) => ({ url: `/${id}`, method: "PUT", body }),
            invalidatesTags: ["FeedingItem"],
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
