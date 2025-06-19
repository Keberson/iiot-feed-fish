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
        title: "Период",
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
        type: "select",
        name: "pool",
        label: "Бассейн",
        options: [
            { value: "all", label: "Все бассейны" },
            { value: "1", label: "Бассейн 1" },
        ],
    },
    {
        type: "select",
        name: "feed",
        label: "Корм",
        options: [{ value: "1", label: "Кром №1" }],
    },
    {
        type: "slider",
        name: "weight",
        label: "Масса",
        marks: {
            0: "0 кг",
            100: "100 кг",
        },
        range: true,
    },
];
