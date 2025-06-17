import { createBrowserRouter, Navigate } from "react-router-dom";

import DashboardRootLayout from "./DashboardRootLayout/DashboardRootLayout";
import General from "./General/General";
import Feeding from "./Feeding/Feeding";
import Logs from "./Logs/Logs";
import Analytics from "./Analytics/Analytics";
import Settings from "./Settings/Settings";
import Help from "./Help/Help";
import ErrorNotFound from "./ErrorNotFound/ErrorNotFound";
import Login from "./Login/Login";
import RootLayout from "./RootLayout/RootLayout";

const router = createBrowserRouter([
    {
        Component: RootLayout,
        errorElement: <Navigate to="/404" />,
        children: [
            {
                path: "/",
                element: <Navigate to="auth" />,
            },
            {
                path: "/auth",
                children: [
                    {
                        index: true,
                        element: <Navigate to="login" />,
                    },
                    {
                        path: "login",
                        Component: Login,
                    },
                ],
            },
            {
                path: "/dashboard",
                Component: DashboardRootLayout,
                children: [
                    {
                        index: true,
                        element: <Navigate to="home" />,
                    },
                    {
                        path: "home",
                        Component: General,
                    },
                    {
                        path: "feeding",
                        Component: Feeding,
                    },
                    {
                        path: "logs",
                        Component: Logs,
                    },
                    {
                        path: "analytics",
                        Component: Analytics,
                    },
                    {
                        path: "settings",
                        Component: Settings,
                    },
                    {
                        path: "help",
                        Component: Help,
                    },
                ],
            },
            {
                path: "/404",
                Component: ErrorNotFound,
            },
        ],
    },
]);

export default router;
