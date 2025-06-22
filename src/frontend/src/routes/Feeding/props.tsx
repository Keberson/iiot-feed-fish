import { Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

import type {
    IFeedingFormDataResponse,
    IFeedingItem,
    IFeedingTableItem,
} from "#types/feeding.types";

import type { DynamicTableColumnType } from "#common/DynamicTable/types";
import type { IFormRenderItem } from "#common/FormRender/interface";

export const columns = (
    deleteCalback: (id: string) => void,
    formData?: IFeedingFormDataResponse
): DynamicTableColumnType<IFeedingItem>[] => [
    {
        title: "Бассейн",
        dataIndex: "pool.id",
        render: (_, record) => record.pool.name,
        key: "pool",
        editable: !!formData,
        editType: "select",
        options: formData?.pool.map((item) => ({ value: item.id, label: item.name })) || [],
    },
    {
        title: "Корм",
        dataIndex: "feed.id",
        render: (_, record) => record.feed.name,
        key: "feed",
        editable: !!formData,
        editType: "select",
        options: formData?.feed.map((item) => ({ value: item.id, label: item.name })) || [],
    },
    {
        title: "Масса (кг)",
        dataIndex: "weight",
        key: "weight",
        editable: true,
        editType: "input",
        inputType: "number",
    },
    {
        title: "Период",
        dataIndex: "period.id",
        render: (_, record) =>
            record.period === "other"
                ? record.other_period.split(":").slice(0, 2).join(":")
                : record.period.name,
        key: "period",
        // editable: !!formData,
        editType: "select",
        options: formData?.period.map((item) => ({ value: item.id, label: item.name })) || [],
    },
    {
        key: "edit",
        render: ({ id }: IFeedingTableItem) => {
            return (
                <Button type="text" onClick={() => deleteCalback(id)}>
                    <DeleteOutlined />
                </Button>
            );
        },
        width: 100,
    },
];

export const filterSchema = (formData?: IFeedingFormDataResponse): IFormRenderItem[] => [
    {
        type: "select",
        name: "pool",
        label: "Бассейн",
        options: formData?.pool.map((item) => ({ value: item.id, label: item.name })) || [],
        allowClear: true,
        placeholder: "Выберите бассейн",
    },
    {
        type: "select",
        name: "feed",
        label: "Корм",
        options: formData?.feed.map((item) => ({ value: item.id, label: item.name })) || [],
        allowClear: true,
        placeholder: "Выберите корм",
    },
    {
        type: "slider",
        name: "weight",
        label: "Масса",
        marks: {
            [formData?.weight.min || 0]: `${formData?.weight.min || 0} кг`,
            [formData?.weight.max || 100]: `${formData?.weight.max || 100} кг`,
        },
        min: formData?.weight.min || 0,
        max: formData?.weight.max || 100,
        range: true,
        disabled: !formData?.weight,
    },
];
