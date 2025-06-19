import useAppSelector from "#core/hooks/useStore/useAppSelector";
import type React from "react";
import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

interface SidenavWrapperProps {
    children: ReactNode;
}

const RedirectWrapper: React.FC<SidenavWrapperProps> = ({ children }) => {
    const location = useLocation();
    const session = useAppSelector(state => state.auth.session);

    if (location.pathname === "/404") {
        return children;
    }

    if (!session && !location.pathname.startsWith("/auth")) {
        return <Navigate to="/auth/login" replace />;
    }

    if (session && location.pathname.startsWith("/auth")) {
        return <Navigate to="/dashboard/home" replace />;
    }

    return children;
};

export default RedirectWrapper;
