import { Divider, Flex, Typography } from "antd";
import { useEffect, useState, type ReactNode } from "react";

import type { IFeedingTableItem } from "#types/feeding.types";

import DynamicTable from "#common/DynamicTable/DynamicTable";
import ChartRender from "#common/ChartRender/ChartRender/ChartRender";

import { useRTKEffects } from "#core/hooks/useRTKEffects/useRTKEffects";
import useAppSelector from "#core/hooks/useStore/useAppSelector";

import { useGetFeedingListQuery } from "#services/feeding";
import { useGetSystemStatusQuery } from "#services/system";

import { columns, getGreetingTitle, statusToView } from "./props";

import "./General.css";

const { Title } = Typography;

const General = () => {
    const [pagination, setPagination] = useState<[number, number]>([1, 10]);
    const username = useAppSelector((state) => state.auth.session?.name);
    const [status, setStatus] = useState<{ icon: ReactNode; label: string }>();
    const greeting = getGreetingTitle();

    const {
        data: feedingList,
        isLoading: loadingFeedingList,
        error: errorFeedingList,
    } = useGetFeedingListQuery({
        pagination: {
            current: pagination[0],
            itemsPerPage: pagination[1],
        },
    });
    const {
        data: systemStatus,
        isLoading: loadingSystemStatus,
        error: errorSystemStatus,
    } = useGetSystemStatusQuery();

    useRTKEffects(
        { isLoading: loadingFeedingList, error: errorFeedingList },
        "GET_FEEDING_GENERAL"
    );
    useRTKEffects(
        { isLoading: loadingSystemStatus, error: errorSystemStatus },
        "GET_SYSTEM_STATUS"
    );

    useEffect(() => {
        setStatus(statusToView(systemStatus?.status));
    }, [systemStatus]);

    return (
        <>
            <Flex className="general-title-wrapper">
                <Flex className="greeting-wrapper">
                    {greeting.icon}
                    <Title level={3} className="title-margin-zero">
                        {greeting.label}, {username}!
                    </Title>
                </Flex>

                <Flex className="status-wrapper">
                    <Title level={4} className="title-margin-zero">
                        Статус системы: {status?.icon || ""} {status?.label || ""}
                    </Title>
                </Flex>
            </Flex>

            <Divider />

            <Flex className="general-layout">
                <Flex vertical className="general-feeding">
                    <Title level={4}>Запланированное кормление</Title>
                    <DynamicTable<IFeedingTableItem>
                        pagination={feedingList}
                        paginationState={[pagination, setPagination]}
                        columns={columns}
                        data={(feedingList?.data || []).map((item) => ({
                            id: item.uuid,
                            pool: item.pool.name,
                            feed: item.feed.name,
                            weight: item.weight,
                            period:
                                item.period !== "other"
                                    ? item.period.name
                                    : item.other_period.split(":").slice(0, 2).join(":"),
                        }))}
                        rowKey="id"
                    />
                </Flex>
                <Flex vertical className="general-feeding">
                    <Title level={4}>Расход корма</Title>
                    <ChartRender
                        data={[
                            {
                                name: "Корм 1",
                                value: 1000,
                            },
                            {
                                name: "Корм 2",
                                value: 550,
                            },
                            {
                                name: "Корм 3",
                                value: 780,
                            },
                            {
                                name: "Корм 4",
                                value: 1100,
                            },
                        ]}
                        bars={[{ dataKey: "value", fill: "#8884d8" }]}
                        gridDash="3 3"
                        axisX
                        axisXKey="name"
                        axisY
                        tooltip
                        legend
                    />
                </Flex>
            </Flex>
        </>
    );
};

export default General;
