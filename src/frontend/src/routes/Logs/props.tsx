import type { ReactNode } from "react";

import Minecart from "#assets/Minecart/Minecart";
import Bunker from "#assets/Bunker/Bunker";
import System from "#assets/System/System";

import type { DynamicTableColumnType } from "#common/DynamicTable/types";
import type { IFormRenderItem } from "#common/FormRender/interface";

import type { ILogTableItem, ILogType } from "#types/log.types";
import { Flex } from "antd";

const logToStringMap: Record<ILogType, { label: string; icon: ReactNode }> = {
    cart: { label: "Тележка", icon: <Minecart fill="#000" size="16px" /> },
    bunker: { label: "Бункер", icon: <Bunker fill="#000" size="16px" /> },
    system: { label: "Система", icon: <System fill="#000" size="16px" /> },
};

export const columns: DynamicTableColumnType<ILogTableItem>[] = [
    {
        title: "Действие",
        dataIndex: "action",
        key: "action",
    },
    {
        title: "Дата и время",
        dataIndex: "when",
        key: "when",
        render: (_, item) => new Date(item.when).toLocaleString("ru-RU"),
    },
    {
        title: "Описание",
        dataIndex: "description",
        key: "description",
    },
    {
        title: "Тип",
        dataIndex: "type",
        key: "type",
        render: (value: ILogType) => (
            <Flex className="log-type">
                {logToStringMap[value].icon} {logToStringMap[value].label}
            </Flex>
        ),
    },
];

export const filterSchema: IFormRenderItem[] = [
    {
        type: "select",
        name: "type",
        label: "Тип",
        options: [
            { label: "Тележка", value: "cart" },
            { label: "Система", value: "system" },
            { label: "Бункер", value: "bunker" },
        ],
        placeholder: "Выберите тип",
        allowClear: true,
    },
    {
        type: "dateRange",
        name: "dates",
        label: "Даты",
        allowEmpty: [true, true],
        placeholder: ["Начало", "Конец"],
        format: "DD.MM.YYYY",
    },
];
