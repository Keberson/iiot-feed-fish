import type { IFormRenderItem } from "#common/FormRender/interface";
import type { ISystemSettingsForm } from "#types/system.type";

export const schema = ({ wifiSsid, wifiPassword }: ISystemSettingsForm): IFormRenderItem[] => [
    {
        type: "input",
        label: "Wi-Fi SSID",
        name: "wifiSsid",
        initValue: wifiSsid,
    },
    {
        type: "input",
        subtype: "password",
        label: "Wi-Fi Password",
        name: "wifiPassword",
        initValue: wifiPassword,
    },
];
