import { createContext } from "react";

export interface ILoadingContext {
    start: () => void;
    stop: () => void;
}

const defaultValues: ILoadingContext = {
    start: () => {},
    stop: () => {},
};

const LoadingContext = createContext<ILoadingContext>(defaultValues);

export default LoadingContext;
