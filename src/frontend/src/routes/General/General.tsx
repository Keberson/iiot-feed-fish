import { Divider, Flex, Typography } from "antd";
import { useRef, useState } from "react";

import type { IFeedingTableItem } from "#types/feeding.types";

import DynamicTable from "#common/DynamicTable/DynamicTable";
import ChartRender from "#common/ChartRender/ChartRender/ChartRender";

import { useRTKEffects } from "#core/hooks/useRTKEffects/useRTKEffects";

import { useGetFeedingListQuery } from "#services/feeding";

import { columns } from "./props";

import "./General.css";

const { Title } = Typography;

const General = () => {
    const titleRef = useRef<HTMLElement>(null);
    const paginationState = useState<[number, number]>([1, 10]);

    const { data, isLoading, error } = useGetFeedingListQuery({
        pagination: {
            current: paginationState[0][0],
            itemsPerPage: paginationState[0][1],
        },
    });

    useRTKEffects({ isLoading, error }, "GET_FEEDING_GENERAL");

    return (
        <>
            <Title level={3}>Доброго времени суток!</Title>
            <Divider />
            <Flex className="general-layout">
                <Flex vertical className="general-feeding">
                    <Title ref={titleRef} level={4}>
                        Запланированное кормление
                    </Title>
                    <DynamicTable<IFeedingTableItem>
                        pagination={data}
                        paginationState={paginationState}
                        topRef={titleRef}
                        columns={columns}
                        data={(data?.data || []).map((item) => ({
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
