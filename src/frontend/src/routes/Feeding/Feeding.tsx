import { useRef } from "react";
import { Flex, Typography } from "antd";

import DynamicTable from "#common/DynamicTable/DynamicTable";

import type { IFeedingTableItem } from "#types/feeding.types";

import FeedingToolbox from "./FeedingToolbox/FeedingToolbox";
import { columns, filterSchema, mockData } from "./props";

import "./Feeding.css";
import { useForm } from "antd/es/form/Form";

const { Title } = Typography;

const Feeding = () => {
    const titleRef = useRef<HTMLElement>(null);
    const [filterForm] = useForm();
    const [exportForm] = useForm();

    return (
        <>
            <Flex ref={titleRef}>
                <Title level={3}>Управление кормлением</Title>
            </Flex>
            <DynamicTable<IFeedingTableItem>
                filter={filterSchema}
                filterForm={filterForm}
                pagination
                exported={filterSchema}
                exportForm={exportForm}
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
