import { Flex, Typography } from "antd";

import AnalyticsToolbox from "./AnalyticsToolbox/AnalyticsToolbox";
import AnalyticsCard from "./AnalyticsCard/AnalyticsCard";
import AnalyticsTimelineCard from "./AnalyticsTimelineCard/AnalyticsTimelineCard";

import "./Analytics.css";

const { Title } = Typography;

const Analytics = () => {
    return (
        <>
            <Title level={3}>Аналитика</Title>
            <AnalyticsToolbox />
            <Flex className="analytics-layout">
                <AnalyticsCard title="Расход корма по бассейнам" />
                <AnalyticsCard title="Статистика кормлений" />
                <AnalyticsTimelineCard title="Статус задач" />
            </Flex>
        </>
    );
};

export default Analytics;
