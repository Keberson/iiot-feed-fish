import type { IFormRenderItem } from "#common/FormRender/interface";

export const createSchema: IFormRenderItem[] = [
    {
        type: "select",
        label: "Бассейн",
        name: "pool",
        options: [{ value: "1", label: "Бассейн 1" }],
    },
    {
        type: "select",
        label: "Корм",
        name: "feed",
        options: [{ value: "1", label: "Корм №1" }],
    },
    {
        type: "input",
        subtype: "number",
        label: "Масса",
        name: "weight",
    },
    {
        type: "select",
        label: "Время",
        name: "period",
        options: [
            { value: "one-time", label: "Раз в сутки" },
            { value: "other", label: "Другое" },
        ],
    },
    {
        type: "input",
        label: "Время (другое)",
        name: "another-period",
        hidden: true,
    },
];
