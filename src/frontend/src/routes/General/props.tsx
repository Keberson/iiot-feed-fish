import {
    CheckCircleTwoTone,
    CloseCircleTwoTone,
    LoadingOutlined,
    QuestionCircleTwoTone,
} from "@ant-design/icons";

import Moon from "#assets/Moon/Moon";
import Sun from "#assets/Sun/Sun";
import Sunrise from "#assets/Sunrise/Sunrise";
import Sunset from "#assets/Sunset/Sunset";

import type { DynamicTableColumnType } from "#common/DynamicTable/types";
import type { SystemStatus } from "#types/system.type";

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

export const getGreetingTitle = () => {
    const hours = new Date().getHours();

    if (hours >= 5 && hours < 12) {
        return { label: "Доброе утор", icon: <Sunrise /> };
    }

    if (hours >= 12 && hours < 17) {
        return { label: "Добрый день", icon: <Sun /> };
    }

    if (hours >= 17 && hours < 23) {
        return { label: "Добрый вечер", icon: <Sunset /> };
    }

    return { label: "Доброй ночи", icon: <Moon /> };
};

export const statusToView = (value?: SystemStatus) => {
    switch (value) {
        case "warning":
            return {
                label: "Возможна ошибка",
                icon: <QuestionCircleTwoTone twoToneColor="#ffe100" />,
            };
        case "error":
            return { label: "Ошибка", icon: <CloseCircleTwoTone twoToneColor="#ff0000" /> };
        case "ok":
            return { label: "Работает", icon: <CheckCircleTwoTone twoToneColor="#319200" /> };
        default:
            return { label: "", icon: <LoadingOutlined /> };
    }
};
