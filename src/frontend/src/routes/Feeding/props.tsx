import { DeleteOutlined } from "@ant-design/icons";

import type { IDynamicTableSchemaItem } from "#common/DynamicTable/types";
import type { IFeedingTableItem } from "#types/feeding.types";

export const columns: IDynamicTableSchemaItem<IFeedingTableItem>[] = [
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
        render: () => <DeleteOutlined />,
        width: 50,
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
        pool: "Бассейн 1",
        feed: "Корм №1",
        weight: 500,
        period: "18:00",
    },
    {
        id: "R3",
        pool: "Бассейн 1",
        feed: "Корм №1",
        weight: 500,
        period: "18:00",
    },
    {
        id: "R4",
        pool: "Бассейн 1",
        feed: "Корм №1",
        weight: 500,
        period: "18:00",
    },
];
