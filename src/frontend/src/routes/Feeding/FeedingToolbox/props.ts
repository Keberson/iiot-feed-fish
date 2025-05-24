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
        label: "Масса",
        name: "weight",
    },
    {
        type: "input",
        label: "Время",
        name: "period",
    },
];
