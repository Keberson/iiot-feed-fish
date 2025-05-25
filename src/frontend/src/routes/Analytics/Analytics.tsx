import { Card, Flex, Typography } from "antd";

import AnalyticsToolbox from "./AnalyticsToolbox/AnalyticsToolbox";
import AnalyticsCard from "./AnalyticsCard/AnalyticsCard";

import "./Analytics.css";

const { Title } = Typography;

const Analytics = () => {
    return (
        <>
            <Title level={3}>Аналитика</Title>
            <AnalyticsToolbox />
            <Flex className="analytics-layout">
                <AnalyticsCard title="Аналитика 1" />
                <Card title="Аналитика 2">Описание</Card>
                <Card title="Аналитика 3">Описание</Card>
                <Card title="Аналитика 4">Описание</Card>
            </Flex>
        </>
    );
};

export default Analytics;
