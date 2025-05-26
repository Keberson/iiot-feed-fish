import type { DynamicTableColumnType } from "#common/DynamicTable/types";
import type { IFormRenderItem } from "#common/FormRender/interface";

import type { ILogTableItem } from "#types/log.types";

export const columns: DynamicTableColumnType<ILogTableItem>[] = [
    {
        title: "Задание",
        dataIndex: "task",
        key: "task",
    },
    {
        title: "Дата и время",
        dataIndex: "dateTime",
        key: "dateTime",
        render: (value: string) => new Date(value).toLocaleString("ru-RU"),
    },
    {
        title: "Описание",
        dataIndex: "description",
        key: "description",
    },
];

export const filterSchema: IFormRenderItem[] = [
    {
        type: "input",
        name: "input",
        label: "Фильтр №1",
        initValue: "бла бла бла",
    },
    {
        type: "select",
        name: "select",
        label: "Фильтр №2",
        options: [{ value: "1", label: "Бассейн 1" }],
        initValue: "1",
    },
];

export const mockData: ILogTableItem[] = [
    {
        id: "L1",
        task: "Задача 1",
        dateTime: "2025-05-25T08:07:39.136Z",
        description: "Какое-то описание задачи",
    },
];
