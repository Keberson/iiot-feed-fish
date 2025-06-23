import type { IFormRenderItem } from "#common/FormRender/interface";
import type { ISystemSettingsForm } from "#types/system.type";

export const schema = ({ wifiSsid, wifiPassword }: ISystemSettingsForm): IFormRenderItem[] => [
    {
        type: "input",
        label: "SSID",
        name: "wifiSsid",
        initValue: wifiSsid,
    },
    {
        type: "input",
        subtype: "password",
        label: "Пароль",
        name: "wifiPassword",
        initValue: wifiPassword,
    },
];
