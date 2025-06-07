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
                        name: "Бассейн 1",
                        delta: 100,
                    },
                    {
                        name: "Бассейн 2",
                        delta: 150,
                    },
                    {
                        name: "Бассейн 3",
                        delta: 140,
                    },
                    {
                        name: "Бассейн 4",
                        delta: 160,
                    },
                    {
                        name: "Бассейн 5",
                        delta: 110,
                    },
                    {
                        name: "Бассейн 6",
                        delta: 90,
                    },
                ]}
                bars={[{ dataKey: "delta", fill: "#8884d8" }]}
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
