import type { IFormRenderItem } from "#common/FormRender/interface";

import type { IFeedingFormDataResponse } from "#types/feeding.types";

export const createSchema = (formData: IFeedingFormDataResponse): IFormRenderItem[] => [
    {
        type: "select",
        label: "Бассейн",
        name: "pool",
        options: formData.pool.map((item) => ({ value: item.id, label: item.name })),
        placeholder: "Выберите бассейн",
        required: true,
        validators: [{ required: true, message: "Пожалуйста, выберите бассейн" }],
    },
    {
        type: "select",
        label: "Корм",
        name: "feed",
        options: formData.feed.map((item) => ({ value: item.id, label: item.name })),
        placeholder: "Выберите корм",
        required: true,
        validators: [{ required: true, message: "Пожалуйста, выберите корм" }],
    },
    {
        type: "input",
        subtype: "number",
        label: "Масса (кг)",
        name: "weight",
        placeholder: "Введите массу",
        required: true,
        validators: [{ required: true, message: "Пожалуйста, введите массу" }],
    },
    {
        type: "select",
        label: "Время",
        name: "period",
        options: [
            ...formData.period.map((item) => ({ value: item.id, label: item.name })),
            { value: "other", label: "Другое" },
        ],
        placeholder: "Выберите периодичность",
        required: true,
        validators: [{ required: true, message: "Пожалуйста, выберите периодичность" }],
    },
    {
        type: "time",
        label: "Время (другое)",
        name: "other_period",
        dependencies: {
            hide: {
                controlName: "period",
                compareValue: "other",
            },
        },
        placeholder: "Введите время кормления",
        required: true,
        validators: [{ required: true, message: "Пожалуйста, введите время кормления" }],
    },
];
