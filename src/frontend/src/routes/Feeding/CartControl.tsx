import { Button, Card, Flex, Typography } from "antd";
import { RocketOutlined } from "@ant-design/icons";
import { useState } from "react";

import { useMoveForwardMutation } from "#services/api/cart.api";

const { Text } = Typography;

const CartControl = () => {
    const [moveForward, { isLoading }] = useMoveForwardMutation();
    const [lastMessage, setLastMessage] = useState<string>();

    const handleMove = async () => {
        try {
            const res = await moveForward({ direction: "forward" }).unwrap();
            setLastMessage(res.message);
        } catch (e) {
            setLastMessage("Ошибка отправки команды");
        }
    };

    return (
        <Card size="small" title="Управление тележкой">
            <Flex vertical gap={12}>
                <Button type="primary" icon={<RocketOutlined />} loading={isLoading} onClick={handleMove}>
                    Движение вперед
                </Button>
                {lastMessage && <Text type="secondary">{lastMessage}</Text>}
            </Flex>
        </Card>
    );
};

export default CartControl;

