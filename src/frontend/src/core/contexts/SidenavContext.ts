import type { DrawerProps } from "antd";
import { createContext, type ReactNode } from "react";

export interface ISidenavConfig {
    content: ReactNode;
    props?: Omit<DrawerProps, "open">;
}

export interface ISidenavContext {
    open: (config: ISidenavConfig) => void;
    close: () => void;
}

const defaultValues: ISidenavContext = {
    open: () => {},
    close: () => {},
};

const SidenavContext = createContext<ISidenavContext>(defaultValues);

export default SidenavContext;
