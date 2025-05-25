import { useState } from "react";
import { Button, Flex, Modal } from "antd";

import FormRender from "#common/FormRender/FormRender";

import FeedingModalFooter from "./FeedingModalFooter/FeedingModalFooter";
import { createSchema } from "./props";

import "./FeedingToolbox.css";

const FeedingToolbox = () => {
    const [openModal, setOpenModal] = useState(false);

    const closeModal = () => {
        setOpenModal(false);
    };

    return (
        <>
            <Button type="primary" onClick={() => setOpenModal(true)}>
                Создать задачу
            </Button>
            <Modal
                open={openModal}
                onCancel={closeModal}
                centered
                title="Создание задачи кормления"
                footer={<FeedingModalFooter />}
            >
                <Flex className="feeding-create-wrapper">
                    <FormRender schema={createSchema} />
                </Flex>
            </Modal>
        </>
    );
};

export default FeedingToolbox;
