import { Card, Flex, Typography } from "antd";

import ChartRender from "#common/ChartRender/ChartRender/ChartRender";
import AnalyticsCardToolbox from "#common/AnalyticsCardToolbox/AnalyticsCardToolbox";

import "./AnalyticsCard.css";

const { Title } = Typography;

interface AnalyticsCardProps {
    title: string;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title }) => {
    return (
        <Card
            title={
                <Flex className="analytics-card-title-wrapper">
                    <Title className="analytics-card-title" level={5}>
                        {title}
                    </Title>
                    <AnalyticsCardToolbox perioded={[]} filtered={[]} exported={[]} />
                </Flex>
            }
        >
            <ChartRender
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
                bars={[
                    { dataKey: "pv", fill: "#8884d8" },
                    { dataKey: "uv", fill: "#82ca9d" },
                ]}
                gridDash="3 3"
                axisX
                axisXKey="name"
                axisY
                tooltip
                legend
            />
        </Card>
    );
};

export default AnalyticsCard;
