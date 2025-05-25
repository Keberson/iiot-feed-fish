import { Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

import type { DynamicTableColumnType } from "#common/DynamicTable/types";
import type { IFeedingTableItem } from "#types/feeding.types";
import type { IFormRenderItem } from "#common/FormRender/interface";

export const columns: DynamicTableColumnType<IFeedingTableItem>[] = [
    {
        title: "Бассейн",
        dataIndex: "pool",
        key: "pool",
        editable: true,
    },
    {
        title: "Корм",
        dataIndex: "feed",
        key: "feed",
        editable: true,
    },
    {
        title: "Масса (г)",
        dataIndex: "weight",
        key: "weight",
        editable: true,
    },
    {
        title: "Время",
        dataIndex: "period",
        key: "period",
        editable: true,
    },
    {
        key: "edit",
        render: () => (
            <Button type="text">
                <DeleteOutlined />
            </Button>
        ),
        width: 100,
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

export const mockData: IFeedingTableItem[] = [
    {
        id: "R1",
        pool: "Бассейн 1",
        feed: "Корм №1",
        weight: 500,
        period: "18:00",
    },
    {
        id: "R2",
        pool: "Бассейн 2",
        feed: "Корм №1",
        weight: 500,
        period: "18:00",
    },
    {
        id: "R3",
        pool: "Бассейн 3",
        feed: "Корм №1",
        weight: 500,
        period: "18:00",
    },
    {
        id: "R4",
        pool: "Бассейн 4",
        feed: "Корм №1",
        weight: 500,
        period: "18:00",
    },
    {
        id: "R5",
        pool: "Бассейн 5",
        feed: "Корм №1",
        weight: 500,
        period: "18:00",
    },
    {
        id: "R6",
        pool: "Бассейн 6",
        feed: "Корм №1",
        weight: 500,
        period: "18:00",
    },
    {
        id: "R7",
        pool: "Бассейн 7",
        feed: "Корм №1",
        weight: 500,
        period: "18:00",
    },
    {
        id: "R8",
        pool: "Бассейн 8",
        feed: "Корм №1",
        weight: 500,
        period: "18:00",
    },
    {
        id: "R9",
        pool: "Бассейн 9",
        feed: "Корм №1",
        weight: 500,
        period: "18:00",
    },
    {
        id: "R10",
        pool: "Бассейн 10",
        feed: "Корм №1",
        weight: 500,
        period: "18:00",
    },
];
