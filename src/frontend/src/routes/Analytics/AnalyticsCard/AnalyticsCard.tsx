import { Card, Flex, Typography } from "antd";
import { useEffect, useState } from "react";

import ChartRender from "#common/ChartRender/ChartRender/ChartRender";
import AnalyticsCardToolbox from "#common/AnalyticsCardToolbox/AnalyticsCardToolbox";

import "./AnalyticsCard.css";

const { Title } = Typography;

interface AnalyticsCardProps {
    title: string;
}

interface ChartData {
    name: string;
    delta: number;
}

const generateRandomData = (isFeedingStats: boolean = false): ChartData[] => {
    const pools = ["Бассейн 1", "Бассейн 2", "Бассейн 3", "Бассейн 4", "Бассейн 5", "Бассейн 6"];
    return pools.map((name) => ({
        name,
        delta: isFeedingStats
            ? Math.floor(Math.random() * 20) + 5 // Для статистики кормлений: от 5 до 25
            : Math.floor(Math.random() * 100) + 50, // Для расхода корма: от 50 до 150
    }));
};

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title }) => {
    const isFeedingStats = title === "Статистика кормлений";
    const [chartData, setChartData] = useState<ChartData[]>(generateRandomData(isFeedingStats));

    useEffect(() => {
        // Обновляем данные каждые 3 секунды
        const interval = setInterval(() => {
            setChartData(generateRandomData(isFeedingStats));
        }, 3000);

        return () => clearInterval(interval);
    }, [isFeedingStats]);

    // Разные цвета для разных графиков
    const barColor = isFeedingStats ? "#52c41a" : "#8884d8";

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
                data={chartData}
                bars={[{ dataKey: "delta", fill: barColor }]}
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
