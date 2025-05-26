import { Typography } from "antd";

import "./Settings.css";
import FormRender from "#common/FormRender/FormRender";
import { schema } from "./props";

const { Title } = Typography;

const Settings = () => {
    return (
        <>
            <Title level={3}>Настройки</Title>
            <FormRender schema={schema} />
        </>
    );
};

export default Settings;
