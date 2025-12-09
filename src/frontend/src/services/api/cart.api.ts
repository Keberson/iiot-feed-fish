import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { prepareHeaders } from "#core/functions/prepareHeaders/prepareHeader";

import type { ICartMoveRequest, ICartMoveResponse } from "#types/cart.types";

export const cartApi = createApi({
    reducerPath: "cartApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/cart`,
        prepareHeaders,
    }),
    endpoints: (builder) => ({
        moveForward: builder.mutation<ICartMoveResponse, ICartMoveRequest | void>({
            query: (body = { direction: "forward" }) => ({
                url: "/move",
                method: "POST",
                body,
            }),
        }),
    }),
});

export const { useMoveForwardMutation } = cartApi;

