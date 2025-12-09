import type { AuthState } from "#services/slices/auth.slice";

export const prepareHeaders = (headers: Headers, { getState }: { getState: () => unknown }) => {
    headers.set(
        "Authorization",
        `Bearer ${(getState() as { auth: AuthState }).auth.session?.token}`
    );
};
