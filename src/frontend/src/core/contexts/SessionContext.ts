import { createContext } from "react";

export interface ISession {
    name: string;
    token: string;
}

export interface ISessionContext {
    login: (session: ISession) => void;
    logout: () => void;
    session: ISession | null;
}

const defaultValues: ISessionContext = {
    login: () => {},
    logout: () => {},
    session: null,
};

const SessionContext = createContext<ISessionContext>(defaultValues);

export default SessionContext;
