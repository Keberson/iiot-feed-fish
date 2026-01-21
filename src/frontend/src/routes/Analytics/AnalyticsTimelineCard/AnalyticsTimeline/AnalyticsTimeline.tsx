import { Steps } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

import FishPoolFeed from "#assets/FishPoolFeed/FishPoolFeed";

import "./AnalyticsTimeline.css";

type StepStatus = "wait" | "process" | "finish" | "error";

interface TimelineItem {
    title: string;
    subTitle?: string;
    status: StepStatus;
    icon: React.ReactNode;
}

const generateTimelineItems = (): TimelineItem[] => {
    const statuses: StepStatus[] = ["wait", "process", "finish"];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return [
        {
            title: "Бассейн №1",
            subTitle: "Кормление №1",
            status: randomStatus === "finish" ? "finish" : randomStatus === "process" ? "process" : "wait",
            icon: randomStatus === "finish" ? (
                <FishPoolFeed fill="#1890ff" />
            ) : randomStatus === "process" ? (
                <LoadingOutlined />
            ) : (
                <FishPoolFeed fill="rgba(0,0,0,0.25)" withBubles={false} />
            ),
        },
        {
            title: "Бассейн №2",
            subTitle: "Кормление №1",
            status: randomStatus === "process" ? "process" : randomStatus === "wait" ? "wait" : "finish",
            icon: randomStatus === "process" ? (
                <LoadingOutlined />
            ) : randomStatus === "finish" ? (
                <FishPoolFeed fill="#1890ff" />
            ) : (
                <FishPoolFeed fill="rgba(0,0,0,0.25)" withBubles={false} />
            ),
        },
        {
            title: "Бассейн №3",
            status: randomStatus === "wait" ? "wait" : randomStatus === "process" ? "process" : "finish",
            icon: randomStatus === "wait" ? (
                <FishPoolFeed fill="rgba(0,0,0,0.25)" withBubles={false} />
            ) : randomStatus === "process" ? (
                <LoadingOutlined />
            ) : (
                <FishPoolFeed fill="#1890ff" />
            ),
        },
    ];
};

const AnalyticsTimeline = () => {
    const [timelineItems, setTimelineItems] = useState<TimelineItem[]>(generateTimelineItems());
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // Обновляем таймлайн каждые 4 секунды
        const interval = setInterval(() => {
            setTimelineItems(generateTimelineItems());
            setCurrentIndex((prev) => (prev + 1) % 5);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    // Генерируем несколько таймлайнов с разными данными
    const timelines = Array.from({ length: 5 }, (_, index) => {
        const items = index === currentIndex ? timelineItems : generateTimelineItems();
        return (
            <Steps
                key={index}
                labelPlacement="vertical"
                className="custom-steps"
                items={items}
            />
        );
    });

    return <>{timelines}</>;
};

export default AnalyticsTimeline;
