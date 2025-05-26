import { Button, Flex } from "antd";
import { ExportOutlined } from "@ant-design/icons";

import "./AnalyticsCardToolbox.css";

const AnalyticsCardToolbox = () => {
    return (
        <Flex className="analytics-card-toolbox">
            <Button>Период</Button>
            <Button>Фильтр</Button>
            <Button type="primary">
                <ExportOutlined />
            </Button>
        </Flex>
    );
};

export default AnalyticsCardToolbox;
