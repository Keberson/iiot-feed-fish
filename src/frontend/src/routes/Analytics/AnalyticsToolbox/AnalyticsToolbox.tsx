import { Button, Dropdown, Flex } from "antd";

import "./AnalyticsToolbox.css";

const AnalyticsToolbox = () => {
    return (
        <Flex className="analytics-toolbox">
            <Dropdown
                menu={{
                    items: [
                        { key: "1", label: "Диаграмма 1" },
                        { type: "divider" },
                        { key: "2", label: "Что-то 2" },
                    ],
                }}
            >
                <Button>Фреймы</Button>
            </Dropdown>
        </Flex>
    );
};

export default AnalyticsToolbox;
