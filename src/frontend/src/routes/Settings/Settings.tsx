import { Typography } from "antd";
import { useForm } from "antd/es/form/Form";

import FormRender from "#common/FormRender/FormRender";

import { schema } from "./props";

import "./Settings.css";

const { Title } = Typography;

const Settings = () => {
    const [form] = useForm();

    return (
        <>
            <Title level={3}>Настройки</Title>
            <FormRender schema={schema} form={form} />
        </>
    );
};

export default Settings;
