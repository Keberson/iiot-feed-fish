import { useContext } from "react";
import { Button, Flex } from "antd";
import { useForm } from "antd/es/form/Form";

import ModalContext from "#core/contexts/ModalContext";

import FormRender from "#common/FormRender/FormRender";

import { useLazyGetFeedingFormDataQuery } from "#services/api/feeding.api";

import FeedingModalFooter from "./FeedingModalFooter/FeedingModalFooter";
import { createSchema } from "./props";

import "./FeedingToolbox.css";

const FeedingToolbox = () => {
    const { open, close } = useContext(ModalContext);
    const [form] = useForm();
    const [getFormData] = useLazyGetFeedingFormDataQuery();

    const closeModal = () => {
        close();
        form.resetFields();
    };

    const openModal = () => {
        getFormData()
            .unwrap()
            .then((formData) =>
                open({
                    content: (
                        <Flex className="feeding-create-wrapper">
                            <FormRender schema={createSchema(formData)} form={form} />
                        </Flex>
                    ),
                    props: {
                        onCancel: closeModal,
                        centered: true,
                        title: "Создание задачи кормления",
                        footer: <FeedingModalFooter onCancel={closeModal} form={form} />,
                    },
                })
            );
    };

    return (
        <>
            <Button type="primary" onClick={openModal}>
                Создать задачу
            </Button>
        </>
    );
};

export default FeedingToolbox;
