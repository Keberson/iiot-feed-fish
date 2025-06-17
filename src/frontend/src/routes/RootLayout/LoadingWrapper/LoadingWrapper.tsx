import { Spin } from "antd";
import { useState, type ReactNode } from "react";

import LoadingContext from "#core/contexts/LoadingContext";

interface LoadingWrapperProps {
    children: ReactNode;
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({ children }) => {
    const [loading, setLoading] = useState<boolean>(false);

    const start = () => {
        setLoading(true);
    };

    const stop = () => {
        setLoading(false);
    };

    return (
        <LoadingContext.Provider value={{ start, stop }}>
            <Spin fullscreen spinning={loading} />
            {children}
        </LoadingContext.Provider>
    );
};

export default LoadingWrapper;
