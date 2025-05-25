import { Button, Card, Flex, Typography } from "antd";

import AnalyticsToolbox from "./AnalyticsToolbox/AnalyticsToolbox";

import "./Analytics.css";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { ExportOutlined } from "@ant-design/icons";

const { Title } = Typography;

const Analytics = () => {
    return (
        <>
            <Title level={3}>Аналитика</Title>
            <AnalyticsToolbox />
            <Flex className="analytics-layout">
                <Card
                    title={
                        <Flex align="center" justify="space-between">
                            <Title style={{ margin: 0 }} level={5}>
                                Аналитика 1
                            </Title>
                            <Flex gap={20}>
                                <Button>Период</Button>
                                <Button>Фильтр</Button>
                                <Button type="primary">
                                    <ExportOutlined />
                                </Button>
                            </Flex>
                        </Flex>
                    }
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={[
                                {
                                    name: "Page A",
                                    uv: 4000,
                                    pv: 2400,
                                },
                                {
                                    name: "Page B",
                                    uv: 3000,
                                    pv: 1398,
                                },
                                {
                                    name: "Page C",
                                    uv: 2000,
                                    pv: 9800,
                                },
                                {
                                    name: "Page D",
                                    uv: 2780,
                                    pv: 3908,
                                },
                                {
                                    name: "Page E",
                                    uv: 1890,
                                    pv: 4800,
                                },
                                {
                                    name: "Page F",
                                    uv: 2390,
                                    pv: 3800,
                                },
                                {
                                    name: "Page G",
                                    uv: 3490,
                                    pv: 4300,
                                },
                            ]}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="pv" fill="#8884d8" />
                            <Bar dataKey="uv" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Аналитика 2">Описание</Card>
                <Card title="Аналитика 3">Описание</Card>
                <Card title="Аналитика 4">Описание</Card>
            </Flex>
        </>
    );
};

export default Analytics;
