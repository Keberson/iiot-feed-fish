import { useState, type ReactNode } from "react";
import type React from "react";
import { Drawer } from "antd";

import SidenavContext, { type ISidenavConfig } from "#core/contexts/SidenavContext";

interface SidenavWrapperProps {
    children: ReactNode;
}

const SidenavWrapper: React.FC<SidenavWrapperProps> = ({ children }) => {
    const [opened, setOpened] = useState<boolean>(false);
    const [config, setConfig] = useState<ISidenavConfig | null>(null);

    const open = (config: ISidenavConfig) => {
        setOpened(true);
        setConfig(config);
    };

    const close = () => {
        setOpened(false);
        setConfig(null);
    };

    return (
        <SidenavContext.Provider value={{ open, close }}>
            <Drawer open={opened} {...config?.props}>
                {config?.content}
            </Drawer>
            {children}
        </SidenavContext.Provider>
    );
};

export default SidenavWrapper;
