import type React from "react";
import { useState, type ReactNode } from "react";
import { Modal } from "antd";

import ModalContext, { type IModalConfig } from "#core/contexts/ModalContext";

interface ModalWrapperProps {
    children: ReactNode;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({ children }) => {
    const [opened, setOpened] = useState<boolean>(false);
    const [config, setConfig] = useState<IModalConfig | null>(null);

    const open = (config: IModalConfig) => {
        setOpened(true);
        setConfig(config);
    };

    const close = () => {
        setOpened(false);
        setConfig(null);
    };

    return (
        <ModalContext.Provider value={{ open, close }}>
            {children}
            <Modal open={opened} {...config?.props}>
                {config?.content}
            </Modal>
        </ModalContext.Provider>
    );
};

export default ModalWrapper;
