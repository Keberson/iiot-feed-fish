import { createBrowserRouter } from "react-router-dom";

import RootLayout from "./RootLayout/RootLayout";
import General from "./General/General";
import Feeding from "./Feeding/Feeding";
import Logs from "./Logs/Logs";
import Analytics from "./Analytics/Analytics";
import Settings from "./Settings/Settings";
import Help from "./Help/Help";
import DashboardRedirect from "./DashboardRedirect/DashboardRedirect";
import ErrorNotFound from "./ErrorNotFound/ErrorNotFound";

const router = createBrowserRouter([
    {
        path: "/",
        Component: DashboardRedirect,
    },
    {
        path: "/dashboard",
        Component: RootLayout,
        children: [
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
        path: "*",
        Component: ErrorNotFound,
    },
]);

export default router;
