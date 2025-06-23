import { useRef, useState } from "react";
import { Flex, Typography } from "antd";

import {
    useDeleteFeedingByIdMutation,
    useGetFeedingFormDataQuery,
    useGetFeedingListQuery,
    usePatchFeedingByIdMutation,
} from "#services/feeding";

import { useRTKEffects } from "#core/hooks/useRTKEffects/useRTKEffects";

import DynamicTable from "#common/DynamicTable/DynamicTable";

import type { IFeedingFilterRaw, IFeedingItem } from "#types/feeding.types";

import FeedingToolbox from "./FeedingToolbox/FeedingToolbox";
import { columns, filterSchema } from "./props";

import "./Feeding.css";

const { Title } = Typography;

const Feeding = () => {
    const [pagination, setPagination] = useState<[number, number]>([1, 10]);
    const [filter, setFilter] = useState<IFeedingFilterRaw>();
    const titleRef = useRef<HTMLElement>(null);
    const {
        data: feedingList,
        isLoading: isLoadingList,
        error: errorList,
    } = useGetFeedingListQuery({
        pagination: {
            current: pagination[0],
            itemsPerPage: pagination[1],
        },
        filter: {
            pool: filter?.pool,
            feed: filter?.feed,
            minWeight: filter?.weight ? filter?.weight[0] : undefined,
            maxWeight: filter?.weight ? filter?.weight[1] : undefined,
        },
    });

    const [deleteFeeding, optionsDelete] = useDeleteFeedingByIdMutation();
    const {
        data: formData,
        isLoading: isLoadingFormData,
        error: errorFormData,
    } = useGetFeedingFormDataQuery();
    const [patchFeeding, optionsPatch] = usePatchFeedingByIdMutation();

    useRTKEffects({ isLoading: isLoadingList, error: errorList }, "GET_FEEDING");
    useRTKEffects({ isLoading: isLoadingFormData, error: errorFormData }, "GET_FORM-DATA");
    useRTKEffects(optionsDelete, "DELETE_FEEDING", "UPDATE", "Успешно удалено");
    useRTKEffects(optionsPatch, "PATCH_FEEDING", "UPDATE", "Успешно обновлено");

    const handleUpdateItem = (partialItems: unknown, item: unknown) => {
        const itemCasted = item as IFeedingItem;
        const partialItemsCasted = partialItems as {
            "pool.id"?: string;
            "feed.id"?: string;
            weight?: number;
        };

        if ("pool.id" in partialItemsCasted) {
            patchFeeding({ id: itemCasted.uuid, body: { pool_id: partialItemsCasted["pool.id"] } });
        }

        if ("feed.id" in partialItemsCasted) {
            patchFeeding({
                id: itemCasted.uuid,
                body: { feed_id: partialItemsCasted["feed.id"] },
            });
        }

        if ("weight" in partialItemsCasted) {
            patchFeeding({ id: itemCasted.uuid, body: { weight: partialItemsCasted["weight"] } });
        }
    };

    return (
        <>
            <Flex ref={titleRef}>
                <Title level={3}>Управление кормлением</Title>
            </Flex>
            <DynamicTable<IFeedingItem, IFeedingFilterRaw>
                filter={filterSchema(formData)}
                filterState={[filter, setFilter]}
                pagination={feedingList}
                paginationState={[pagination, setPagination]}
                exported={filterSchema(formData)}
                topRef={titleRef}
                columns={columns(deleteFeeding, formData)}
                data={feedingList?.data || []}
                rowKey="uuid"
                toolbox={<FeedingToolbox />}
                handleUpdateItem={handleUpdateItem}
            />
        </>
    );
};

export default Feeding;
