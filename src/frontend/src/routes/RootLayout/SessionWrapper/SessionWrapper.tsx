import { useState, type ReactNode } from "react";

import SessionContext, { type ISession } from "#core/contexts/SessionContext";

interface SessionWrapperProps {
    children: ReactNode;
}

const SessionWrapper: React.FC<SessionWrapperProps> = ({ children }) => {
    const [session, setSession] = useState<ISession | null>(null);

    const login = (newSession: ISession) => {
        setSession(newSession);
    };

    const logout = () => {
        setSession(null);
    };

    return (
        <SessionContext.Provider value={{ login, logout, session }}>
            {children}
        </SessionContext.Provider>
    );
};

export default SessionWrapper;
