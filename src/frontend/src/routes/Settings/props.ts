import type { IFormRenderItem } from "#common/FormRender/interface";

export const schema: IFormRenderItem[] = [
    {
        type: "title",
        initValue: "Wi-Fi",
        level: 4,
        name: "wifi-title",
    },
    {
        type: "text",
        initValue: "Настройка Wi-Fi сети контроллеров",
        name: "wifi-description",
    },
    {
        type: "input",
        label: "SSID",
        name: "wifi-ssid",
        initValue: "wifi-ssid",
    },
    {
        type: "input",
        subtype: "password",
        label: "Пароль",
        name: "wifi-password",
        initValue: "1234567890",
    },
    {
        type: "divider",
        name: "wifi-divider",
    },
];
