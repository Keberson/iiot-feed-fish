import { useContext, useEffect } from "react";
import type { QueryStatus } from "@reduxjs/toolkit/query";

import type { IBaseErrorResponse } from "#types/api.types";

import LoadingContext from "#core/contexts/LoadingContext";
import MessageContext from "#core/contexts/MessageContext";

const errorMessages: Record<number, string> = {
    400: "Некорректный запрос",
    401: "Ошибка при авторизации",
};

export const useRTKEffects = (
    { isLoading, error, status }: { isLoading?: boolean; error?: unknown; status?: QueryStatus },
    action: string,
    method: "GET" | "UPDATE" = "GET",
    successMessage: string = "Успешно выполнено"
) => {
    const { start, stop } = useContext(LoadingContext);
    const { messageApi } = useContext(MessageContext);

    useEffect(() => {
        if (isLoading !== undefined) {
            if (isLoading) {
                start(action);
            } else {
                stop(action);
            }
        }
    }, [isLoading]);

    useEffect(() => {
        if (status && status === "fulfilled" && method === "UPDATE") {
            messageApi?.success(successMessage);
        }
    }, [status]);

    useEffect(() => {
        if (error) {
            const errorCasted = error as IBaseErrorResponse;
            const content =
                errorCasted.data.message ||
                (errorCasted.status in errorMessages
                    ? errorMessages[errorCasted.status]
                    : "Что-то пошло не так");

            messageApi?.error({ content });
        }
    }, [error]);
};
