import { isRejectedWithValue, isPending, isFulfilled } from "@reduxjs/toolkit";
import type { Middleware } from "@reduxjs/toolkit";

const loadingMiddleware: Middleware =
    ({ dispatch }) =>
    (next) =>
    (action) => {
        if (isPending(action)) {
            dispatch({ type: "loading/startLoading", payload: action.meta.requestId });
        }

        if (isFulfilled(action) || isRejectedWithValue(action)) {
            dispatch({ type: "loading/endLoading", payload: action.meta.requestId });
        }

        return next(action);
    };

export default loadingMiddleware;
