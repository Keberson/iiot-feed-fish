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
                <AnalyticsCard title="Графики" />
                <AnalyticsTimelineCard title="Стаутс задач" />
                {/* <Card title="Аналитика 3">Описание</Card>
                <Card title="Аналитика 4">Описание</Card> */}
            </Flex>
        </>
    );
};

export default Analytics;
