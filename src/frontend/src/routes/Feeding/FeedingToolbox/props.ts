import type { IFormRenderItem } from "#common/FormRender/interface";

export const createSchema: IFormRenderItem[] = [
    {
        type: "select",
        label: "Бассейн",
        name: "pool",
        options: [{ value: "1", label: "Бассейн 1" }],
        placeholder: "Выберите бассейн",
        required: true,
        validators: [{ required: true, message: "Пожалуйста, выберите бассейн" }],
    },
    {
        type: "select",
        label: "Корм",
        name: "feed",
        options: [{ value: "1", label: "Корм №1" }],
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
            { value: "one-time", label: "Раз в сутки" },
            { value: "other", label: "Другое" },
        ],
        placeholder: "Выберите периодичность",
        required: true,
        validators: [{ required: true, message: "Пожалуйста, выберите периодичность" }],
    },
    {
        type: "time",
        label: "Время (другое)",
        name: "another-period",
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
