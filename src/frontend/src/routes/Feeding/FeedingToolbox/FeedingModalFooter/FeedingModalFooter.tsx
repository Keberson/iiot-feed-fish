import type React from "react";
import { Button, Flex, type FormInstance } from "antd";

import "./FeedingModalFooter.css";

interface FeedingModalFooterProps {
    onCancel: () => void;
    form: FormInstance;
}

const FeedingModalFooter: React.FC<FeedingModalFooterProps> = ({ onCancel, form }) => {
    const create = () => {
        form.validateFields()
            .then((res) => console.log(res))
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
