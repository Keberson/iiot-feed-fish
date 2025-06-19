import { Spin } from "antd";
import { useEffect, useState, type ReactNode } from "react";
import { useNavigation } from "react-router-dom";

import LoadingContext from "#core/contexts/LoadingContext";

interface LoadingWrapperProps {
    children: ReactNode;
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({ children }) => {
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const navigation = useNavigation();

    useEffect(() => {
        if (navigation.state === "loading") {
            setLoading((loadings) => ({ ...loadings, PageLoading: true }));
        }
    }, [navigation]);

    const start = (action: string) => {
        setLoading((prevState) => ({ ...prevState, [action]: true }));
    };

    const stop = (action: string) => {
        setLoading((prev) => {
            const newState = { ...prev };
            delete newState[action];
            return newState;
        });
    };

    return (
        <LoadingContext.Provider value={{ start, stop }}>
            <Spin fullscreen spinning={Object.keys(loading).length > 0} />
            {children}
        </LoadingContext.Provider>
    );
};

export default LoadingWrapper;
