import type { DynamicTableColumnType } from "#common/DynamicTable/types";

export interface IFeedingTableItem {
    id: string;
    pool: string;
    feed: string;
    weight: number;
    period: string;
}

export const columns: DynamicTableColumnType<IFeedingTableItem>[] = [
    {
        title: "Бассейн",
        dataIndex: "pool",
        key: "pool",
    },
    {
        title: "Корм",
        dataIndex: "feed",
        key: "feed",
    },
    {
        title: "Масса (кг)",
        dataIndex: "weight",
        key: "weight",
    },
    {
        title: "Период",
        dataIndex: "period",
        key: "period",
    },
];
