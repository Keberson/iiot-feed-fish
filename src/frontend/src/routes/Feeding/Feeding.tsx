import { useRef } from "react";
import { Flex, Typography } from "antd";
import { useForm } from "antd/es/form/Form";

import { useGetFeedingListQuery } from "#services/feeding";

import { useRTKEffects } from "#core/hooks/useRTKEffects/useRTKEffects";

import DynamicTable from "#common/DynamicTable/DynamicTable";

import type { IFeedingTableItem } from "#types/feeding.types";

import FeedingToolbox from "./FeedingToolbox/FeedingToolbox";
import { columns, filterSchema } from "./props";

import "./Feeding.css";

const { Title } = Typography;

const Feeding = () => {
    const titleRef = useRef<HTMLElement>(null);
    const [filterForm] = useForm();
    const [exportForm] = useForm();
    const { data, isLoading, error } = useGetFeedingListQuery();

    useRTKEffects({ isLoading, error }, "GET_FEEDING");

    return (
        <>
            <Flex ref={titleRef}>
                <Title level={3}>Управление кормлением</Title>
            </Flex>
            <DynamicTable<IFeedingTableItem>
                filter={filterSchema}
                filterForm={filterForm}
                // pagination
                exported={filterSchema}
                exportForm={exportForm}
                topRef={titleRef}
                columns={columns}
                data={data || []}
                rowKey="id"
                toolbox={<FeedingToolbox />}
            />
        </>
    );
};

export default Feeding;
