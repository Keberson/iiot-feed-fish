import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
    ICheckTokenRequest,
    ICheckTokenResponse,
    ILoginRequest,
    ILoginResponse,
} from "#types/auth.types";

export const authApi = createApi({
    reducerPath: "authApi",
    tagTypes: [],
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api"}/auth`,
    }),
    endpoints: (builder) => ({
        login: builder.mutation<ILoginResponse, ILoginRequest>({
            query: (body) => ({ url: `/login`, method: "POST", body }),
        }),
        checkToken: builder.mutation<ICheckTokenResponse, ICheckTokenRequest>({
            query: (body) => ({ url: `/token`, method: "POST", body }),
        }),
    }),
});

export const { useLoginMutation, useCheckTokenMutation } = authApi;
