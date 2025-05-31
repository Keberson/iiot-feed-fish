import { Divider, Flex, Typography } from "antd";

import DynamicTable from "#common/DynamicTable/DynamicTable";

import "./General.css";
import type { IFeedingTableItem } from "#types/feeding.types";
import { columns, mockData } from "#routes/Feeding/props";
import { useRef } from "react";
import ChartRender from "#common/ChartRender/ChartRender/ChartRender";

const { Title } = Typography;

const General = () => {
    const titleRef = useRef<HTMLElement>(null);

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
                        pagination
                        topRef={titleRef}
                        columns={columns.filter((col) => col.key !== "edit")}
                        data={mockData}
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
