import { Steps } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import FishPoolFeed from "#assets/FishPoolFeed/FishPoolFeed";

import "./AnalyticsTimeline.css";

const AnalyticsTimeline = () => {
    return (
        <>
            <Steps
                labelPlacement="vertical"
                className="custom-steps"
                items={[
                    {
                        title: "Бассейн №1",
                        subTitle: "Кормление №1",
                        status: "finish",
                        icon: <FishPoolFeed fill="#1890ff" />,
                    },
                    {
                        title: "Бассейн №2",
                        subTitle: "Кормление №1",
                        status: "process",
                        icon: <LoadingOutlined />,
                    },
                    {
                        title: "Бассейн №3",
                        status: "wait",
                        icon: <FishPoolFeed fill="rgba(0,0,0,0.25)" withBubles={false} />,
                    },
                ]}
            />
            <Steps
                labelPlacement="vertical"
                className="custom-steps"
                items={[
                    {
                        title: "Бассейн №1",
                        subTitle: "Кормление №1",
                        status: "wait",
                        icon: <FishPoolFeed fill="rgba(0,0,0,0.25)" withBubles={false} />,
                    },
                    {
                        title: "Бассейн №2",
                        subTitle: "Кормление №1",
                        status: "wait",
                        icon: <FishPoolFeed fill="rgba(0,0,0,0.25)" withBubles={false} />,
                    },
                    {
                        title: "Бассейн №3",
                        status: "wait",
                        icon: <FishPoolFeed fill="rgba(0,0,0,0.25)" withBubles={false} />,
                    },
                ]}
            />
            <Steps
                labelPlacement="vertical"
                className="custom-steps"
                items={[
                    {
                        title: "Бассейн №1",
                        subTitle: "Кормление №1",
                        status: "wait",
                        icon: <FishPoolFeed fill="rgba(0,0,0,0.25)" withBubles={false} />,
                    },
                    {
                        title: "Бассейн №2",
                        subTitle: "Кормление №1",
                        status: "wait",
                        icon: <FishPoolFeed fill="rgba(0,0,0,0.25)" withBubles={false} />,
                    },
                    {
                        title: "Бассейн №3",
                        status: "wait",
                        icon: <FishPoolFeed fill="rgba(0,0,0,0.25)" withBubles={false} />,
                    },
                ]}
            />
            <Steps
                labelPlacement="vertical"
                className="custom-steps"
                items={[
                    {
                        title: "Бассейн №1",
                        subTitle: "Кормление №1",
                        status: "wait",
                        icon: <FishPoolFeed fill="rgba(0,0,0,0.25)" withBubles={false} />,
                    },
                    {
                        title: "Бассейн №2",
                        subTitle: "Кормление №1",
                        status: "wait",
                        icon: <FishPoolFeed fill="rgba(0,0,0,0.25)" withBubles={false} />,
                    },
                    {
                        title: "Бассейн №3",
                        status: "wait",
                        icon: <FishPoolFeed fill="rgba(0,0,0,0.25)" withBubles={false} />,
                    },
                ]}
            />
            <Steps
                labelPlacement="vertical"
                className="custom-steps"
                items={[
                    {
                        title: "Бассейн №1",
                        subTitle: "Кормление №1",
                        status: "wait",
                        icon: <FishPoolFeed fill="rgba(0,0,0,0.25)" withBubles={false} />,
                    },
                    {
                        title: "Бассейн №2",
                        subTitle: "Кормление №1",
                        status: "wait",
                        icon: <FishPoolFeed fill="rgba(0,0,0,0.25)" withBubles={false} />,
                    },
                    {
                        title: "Бассейн №3",
                        status: "wait",
                        icon: <FishPoolFeed fill="rgba(0,0,0,0.25)" withBubles={false} />,
                    },
                ]}
            />
        </>
    );
};

export default AnalyticsTimeline;
