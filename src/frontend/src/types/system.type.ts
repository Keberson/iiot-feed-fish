export type SystemStatus = "error" | "warning" | "ok";

export interface ISystemStatus {
    status: SystemStatus;
}

export interface ISystemSettings {
    wifi_ssid: string | null;
    wifi_password: string | null;
}

export interface ISystemSettingsForm {
    wifiSsid: string | null;
    wifiPassword: string | null;
}
