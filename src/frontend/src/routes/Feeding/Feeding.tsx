import { useState } from "react";
import { Flex, Typography } from "antd";

import {
    useDeleteFeedingByIdMutation,
    useGetFeedingFormDataQuery,
    useGetFeedingListQuery,
    usePatchFeedingByIdMutation,
} from "#services/api/feeding.api";

import DynamicTable from "#common/DynamicTable/DynamicTable";

import type { IFeedingFilterRaw, IFeedingItem } from "#types/feeding.types";

import FeedingToolbox from "./FeedingToolbox/FeedingToolbox";
import { columns, filterSchema } from "./props";

import "./Feeding.css";

const { Title } = Typography;

const Feeding = () => {
    const [pagination, setPagination] = useState<[number, number]>([1, 10]);
    const [filter, setFilter] = useState<IFeedingFilterRaw>();
    const { data: feedingList } = useGetFeedingListQuery({
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

    const [deleteFeeding] = useDeleteFeedingByIdMutation();
    const { data: formData } = useGetFeedingFormDataQuery();
    const [patchFeeding] = usePatchFeedingByIdMutation();

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
            <Flex>
                <Title level={3}>Управление кормлением</Title>
            </Flex>
            <DynamicTable<IFeedingItem, IFeedingFilterRaw>
                filter={filterSchema(formData)}
                filterState={[filter, setFilter]}
                pagination={feedingList}
                paginationState={[pagination, setPagination]}
                exported={filterSchema(formData)}
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
