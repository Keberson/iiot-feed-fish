import type React from "react";
import { Button, Flex, type FormInstance } from "antd";
import type { Dayjs } from "dayjs";

import { useCreateFeedingMutation } from "#services/api/feeding.api";

import type { IFeedingCreateEditRequest } from "#types/feeding.types";

import "./FeedingModalFooter.css";

interface FeedingModalFooterProps {
    onCancel: () => void;
    form: FormInstance;
}

const FeedingModalFooter: React.FC<FeedingModalFooterProps> = ({ onCancel, form }) => {
    const [createFeedingApi] = useCreateFeedingMutation();

    const createFeedingApiWrapper = (data: IFeedingCreateEditRequest) => {
        createFeedingApi(data).then(onCancel).catch();
    };

    const create = () => {
        form.validateFields()
            .then((formValues) => {
                createFeedingApiWrapper({
                    weight: formValues.weight,
                    pool_id: formValues.pool,
                    feed_id: formValues.feed,
                    period_id: formValues?.other_period ? undefined : formValues.period,
                    other_period: formValues?.other_period
                        ? (formValues?.other_period as Dayjs).format("HH:mm")
                        : undefined,
                });
            })
            .catch();
    };

    return (
        <Flex className="feeding-modal-buttons">
            <Button type="primary" onClick={create}>
                Создать
            </Button>
            <Button onClick={onCancel}>Отменить</Button>
        </Flex>
    );
};

export default FeedingModalFooter;
