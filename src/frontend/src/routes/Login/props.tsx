import { Typography } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";

import type { IFormRenderItem } from "#common/FormRender/interface";

const { Text } = Typography;

export const schema: IFormRenderItem[] = [
    {
        type: "input",
        subtype: "text",
        name: "login",
        label: <Text>Имя пользователя</Text>,
        placeholder: "Введите имя пользователя",
        addonBefore: <UserOutlined />,
        validators: [{ required: true, message: "Пожалуйста, введите имя пользователя" }],
    },
    {
        type: "input",
        subtype: "password",
        name: "password",
        label: <Text>Пароль</Text>,
        placeholder: "Введите пароль",
        addonBefore: <LockOutlined />,
        validators: [{ required: true, message: "Пожалуйста, введите пароль" }],
    },
];
