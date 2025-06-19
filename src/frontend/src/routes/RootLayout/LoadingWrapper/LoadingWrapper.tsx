import { Spin } from "antd";
import { useEffect, useState, type ReactNode } from "react";
import { useNavigation } from "react-router-dom";

import LoadingContext from "#core/contexts/LoadingContext";

import "./LoadingWrapper.css";

interface LoadingWrapperProps {
    children: ReactNode;
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({ children }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
    const navigation = useNavigation();

    useEffect(() => {
        if (navigation.state === "loading") {
            setLoadingMap((loadings) => ({ ...loadings, PageLoading: true }));
        }
    }, [navigation]);

    const start = (action: string) => {
        setLoadingMap((prevState) => ({ ...prevState, [action]: true }));
    };

    const stop = (action: string) => {
        setLoadingMap((prev) => {
            const newState = { ...prev };
            delete newState[action];
            return newState;
        });
    };

    useEffect(() => {
        if (Object.keys(loadingMap).length > 0) {
            setLoading(true);
        } else {
            setTimeout(() => setLoading(false), 250);
        }
    }, [loadingMap]);

    return (
        <LoadingContext.Provider value={{ start, stop }}>
            <Spin fullscreen spinning={loading} rootClassName="spinner" />
            {children}
        </LoadingContext.Provider>
    );
};

export default LoadingWrapper;
