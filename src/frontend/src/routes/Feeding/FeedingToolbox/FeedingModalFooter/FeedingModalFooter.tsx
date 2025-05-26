import { Button, Flex } from "antd";

import "./FeedingModalFooter.css";

const FeedingModalFooter = () => {
    return (
        <Flex className="feeding-modal-buttons">
            <Button type="primary">Создать</Button>
            <Button>Отменить</Button>
        </Flex>
    );
};

export default FeedingModalFooter;
