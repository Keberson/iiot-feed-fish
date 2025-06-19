import { useRef } from "react";
import { Flex, Typography } from "antd";
import { useForm } from "antd/es/form/Form";

import {
    useDeleteFeedingByIdMutation,
    useGetFeedingFormDataQuery,
    useGetFeedingListQuery,
} from "#services/feeding";

import { useRTKEffects } from "#core/hooks/useRTKEffects/useRTKEffects";

import DynamicTable from "#common/DynamicTable/DynamicTable";

import type { IFeedingItem } from "#types/feeding.types";

import FeedingToolbox from "./FeedingToolbox/FeedingToolbox";
import { columns, filterSchema } from "./props";

import "./Feeding.css";

const { Title } = Typography;

const Feeding = () => {
    const titleRef = useRef<HTMLElement>(null);
    const [filterForm] = useForm();
    const [exportForm] = useForm();
    const {
        data: feedingList,
        isLoading: isLoadingList,
        error: errorList,
    } = useGetFeedingListQuery();
    const [deleteFeeding, optionsDelete] = useDeleteFeedingByIdMutation();
    const {
        data: formData,
        isLoading: isLoadingFormData,
        error: errorFormData,
    } = useGetFeedingFormDataQuery();

    useRTKEffects({ isLoading: isLoadingList, error: errorList }, "GET_FEEDING");
    useRTKEffects({ isLoading: isLoadingFormData, error: errorFormData }, "GET_FORM-DATA");
    useRTKEffects(optionsDelete, "DELETE_FEEDING");

    const handleUpdateItem = (item: unknown) => {
        console.log('PATCH', item);
    };

    return (
        <>
            <Flex ref={titleRef}>
                <Title level={3}>Управление кормлением</Title>
            </Flex>
            <DynamicTable<IFeedingItem>
                filter={filterSchema}
                filterForm={filterForm}
                // pagination
                exported={filterSchema}
                exportForm={exportForm}
                topRef={titleRef}
                columns={columns(deleteFeeding, formData)}
                data={feedingList || []}
                rowKey="uuid"
                toolbox={<FeedingToolbox />}
                handleUpdateItem={handleUpdateItem}
            />
        </>
    );
};

export default Feeding;
