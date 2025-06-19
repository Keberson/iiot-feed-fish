import { createContext } from "react";

export interface ILoadingContext {
    start: (action: string) => void;
    stop: (action: string) => void;
}

const defaultValues: ILoadingContext = {
    start: () => {},
    stop: () => {},
};

const LoadingContext = createContext<ILoadingContext>(defaultValues);

export default LoadingContext;
