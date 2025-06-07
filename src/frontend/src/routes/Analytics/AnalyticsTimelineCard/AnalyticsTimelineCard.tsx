import { Card, Flex, Typography } from "antd";

import AnalyticsCardToolbox from "#common/AnalyticsCardToolbox/AnalyticsCardToolbox";
import TimelineFlow from "./AnalyticsTimeline/AnalyticsTimeline";

import "./AnalyticsTimelineCard.css";

const { Title } = Typography;

interface AnalyticsTimelineCardProps {
    title: string;
}

const AnalyticsTimelineCard: React.FC<AnalyticsTimelineCardProps> = ({ title }) => {
    return (
        <Card
            title={
                <Flex className="analytics-card-title-wrapper">
                    <Title className="analytics-card-title" level={5}>
                        {title}
                    </Title>
                    <AnalyticsCardToolbox perioded={[]} />
                </Flex>
            }
            styles={{ body: { overflowY: "auto" } }}
        >
            <Flex
                style={{
                    overflowX: "auto",
                    overflowY: "auto",
                    flexDirection: "column",
                    height: "100%",
                }}
            >
                <TimelineFlow />
            </Flex>
        </Card>
    );
};

export default AnalyticsTimelineCard;
