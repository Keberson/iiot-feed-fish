import { isRejectedWithValue, isRejected, isFulfilled } from "@reduxjs/toolkit";
import type { Middleware } from "@reduxjs/toolkit";
import { message } from "antd";

import type { IBaseErrorResponse } from "#types/api.types";

const errorMessages: Record<number, string> = {
    400: "Некорректный запрос",
    401: "Ошибка при авторизации",
};

const messageMiddleware: Middleware = (_store) => (next) => (action) => {
    if (isRejectedWithValue(action)) {
        const errorCasted = action.payload as IBaseErrorResponse;
        const content =
            errorCasted.data.message ||
            (errorCasted.status in errorMessages
                ? errorMessages[errorCasted.status]
                : "Что-то пошло не так");

        message.error({ content });
    } else if (isRejected(action)) {
        message.error("Что-то пошло не так");
    } else if (isFulfilled(action)) {
        message.success("Успешно выполнено");
    }

    return next(action);
};

export default messageMiddleware;
