import { Button, Flex } from "antd";
import { ExportOutlined } from "@ant-design/icons";

import type { IAnalyticsCardToolboxSchemas } from "./interface";

import "./AnalyticsCardToolbox.css";

interface AnalyticsCardToolboxProps {
    perioded?: IAnalyticsCardToolboxSchemas[];
    filtered?: IAnalyticsCardToolboxSchemas[];
    exported?: IAnalyticsCardToolboxSchemas[];
}

const AnalyticsCardToolbox: React.FC<AnalyticsCardToolboxProps> = ({
    perioded,
    filtered,
    exported,
}) => {
    return (
        <Flex className="analytics-card-toolbox">
            {perioded && <Button>Период</Button>}
            {filtered && <Button>Фильтр</Button>}
            {exported && (
                <Button type="primary">
                    <ExportOutlined />
                </Button>
            )}
        </Flex>
    );
};

export default AnalyticsCardToolbox;
