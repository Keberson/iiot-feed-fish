import { useRef } from "react";
import { Flex, Typography } from "antd";
import { useForm } from "antd/es/form/Form";

import { useDeleteFeedingByIdMutation, useGetFeedingListQuery } from "#services/feeding";

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
    const [deleteFeeding, optionsDelete] = useDeleteFeedingByIdMutation();

    useRTKEffects({ isLoading, error }, "GET_FEEDING");
    useRTKEffects(optionsDelete, "DELETE_FEEDING");

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
                columns={columns(deleteFeeding)}
                data={data || []}
                rowKey="id"
                toolbox={<FeedingToolbox />}
            />
        </>
    );
};

export default Feeding;
