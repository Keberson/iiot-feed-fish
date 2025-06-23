import { Button, Divider, Flex, Typography } from "antd";
import { useForm, useWatch } from "antd/es/form/Form";
import { useEffect, useState } from "react";

import FormRender from "#common/FormRender/FormRender";

import { useRTKEffects } from "#core/hooks/useRTKEffects/useRTKEffects";

import { useGetSystemSettingsQuery, useUpdateSystemSettingsMutation } from "#services/system";

import type { ISystemSettings, ISystemSettingsForm } from "#types/system.type";

import { schema } from "./props";

import "./Settings.css";

const { Title, Text } = Typography;

const Settings = () => {
    const [initState, setInitState] = useState<ISystemSettingsForm>();
    const [isChangedData, setIsChangedData] = useState<boolean>(false);
    const [form] = useForm<ISystemSettingsForm>();
    const values = useWatch([], form);
    const { data, isLoading, error, status } = useGetSystemSettingsQuery();
    const [updateSettings, options] = useUpdateSystemSettingsMutation();

    useRTKEffects({ isLoading, error, status }, "GET_SETTINGS");
    useRTKEffects(options, "UPDATE_SETTINGS", "UPDATE", "Успешно обновлены настройки Wi-Fi");

    const handleSetInitState = (rawData: ISystemSettings | ISystemSettingsForm) => {
        const state =
            "wifi_ssid" in rawData
                ? { wifiSsid: rawData.wifi_ssid, wifiPassword: rawData.wifi_password }
                : { wifiSsid: rawData.wifiSsid, wifiPassword: rawData.wifiPassword };

        setInitState(state);
        setIsChangedData(false);
        form.setFieldsValue(state);
    };

    useEffect(() => {
        if (data) {
            handleSetInitState(data);
        }
    }, [data]);

    useEffect(() => {
        if (JSON.stringify(values) === JSON.stringify(initState)) {
            setIsChangedData(false);
        } else {
            setIsChangedData(true);
        }
    }, [values]);

    const onSave = () => {
        updateSettings(form.getFieldsValue());
    };

    const onReset = () => {
        if (initState) {
            handleSetInitState(initState);
        }
    };

    return (
        <>
            <Title level={3}>Настройки</Title>
            <Title level={4}>Wi-Fi</Title>
            <Text>Настройка Wi-Fi сети контроллеров</Text>
            <FormRender
                schema={schema({
                    wifiSsid: initState?.wifiSsid ?? null,
                    wifiPassword: initState?.wifiPassword ?? null,
                })}
                form={form}
            />
            <Flex className="wifi-buttons">
                <Button type="primary" onClick={onSave} disabled={!isChangedData}>
                    Сохранить
                </Button>
                <Button onClick={onReset} disabled={!isChangedData}>
                    Сбросить
                </Button>
            </Flex>
            <Divider />
        </>
    );
};

export default Settings;
