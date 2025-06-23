import { createContext } from "react";

export interface ILoadingContext {
    start: (action: string) => void;
    stop: (action: string) => void;
    stopAll: () => void;
}

const defaultValues: ILoadingContext = {
    start: () => {},
    stop: () => {},
    stopAll: () => {},
};

const LoadingContext = createContext<ILoadingContext>(defaultValues);

export default LoadingContext;
