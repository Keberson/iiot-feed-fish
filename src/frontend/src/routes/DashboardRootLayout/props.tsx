import type { ItemType } from "antd/es/menu/interface";
import {
    ContainerOutlined,
    HomeOutlined,
    // LineChartOutlined,
    QuestionCircleOutlined,
    ScheduleOutlined,
    // SettingOutlined,
    // ExperimentOutlined,
} from "@ant-design/icons";

import MenuItem from "./MenuItem/MenuItem";

export const items = (prefix: string): ItemType[] =>
    [
        {
            label: "Главная",
            url: "home",
            icon: <HomeOutlined />,
        },
        {
            label: "Кормление",
            url: "feeding",
            icon: <ScheduleOutlined />,
        },
        {
            label: "Логи",
            url: "logs",
            icon: <ContainerOutlined />,
        },
        // {
        //     label: "Аналитика",
        //     url: "analytics",
        //     icon: <LineChartOutlined />,
        // },
        // {
        //     label: "Настройки",
        //     url: "settings",
        //     icon: <SettingOutlined />,
        // },
        // {
        //     label: "Тестирование",
        //     url: "testing",
        //     icon: <ExperimentOutlined />,
        // },
        {
            label: "Помощь",
            url: "help",
            icon: <QuestionCircleOutlined />,
        },
    ].map(({ label, icon, url }) => ({
        label: <MenuItem url={`/${prefix}/${url}`} text={label} key={url} />,
        key: url,
        icon,
    }));
