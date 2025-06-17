import type { ModalProps } from "antd";
import { createContext, type ReactNode } from "react";

export interface IModalConfig {
    content: ReactNode;
    props?: Omit<ModalProps, "open">;
}

export interface IModalContext {
    open: (config: IModalConfig) => void;
    close: () => void;
}

const defaultValues: IModalContext = {
    open: () => {},
    close: () => {},
};

const ModalContext = createContext<IModalContext>(defaultValues);

export default ModalContext;
