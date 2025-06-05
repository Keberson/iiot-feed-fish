import { useRef } from "react";
import { Flex, Typography } from "antd";

import DynamicTable from "#common/DynamicTable/DynamicTable";

import type { IFeedingTableItem } from "#types/feeding.types";

import FeedingToolbox from "./FeedingToolbox/FeedingToolbox";
import { columns, filterSchema, mockData } from "./props";

import "./Feeding.css";

const { Title } = Typography;

const Feeding = () => {
    const titleRef = useRef<HTMLElement>(null);

    return (
        <>
            <Flex ref={titleRef}>
                <Title level={3}>Управление кормлением</Title>
            </Flex>
            <DynamicTable<IFeedingTableItem>
                filter={filterSchema}
                pagination
                exported
                topRef={titleRef}
                columns={columns}
                data={mockData}
                rowKey="id"
                toolbox={<FeedingToolbox />}
            />
        </>
    );
};

export default Feeding;
