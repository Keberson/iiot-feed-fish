import { createBrowserRouter } from "react-router-dom";

import RootLayout from "./RootLayout/RootLayout";
import General from "./General/General";
import Feeding from "./Feeding/Feeding";
import Logs from "./Logs/Logs";
import Analytics from "./Analytics/Analytics";
import Settings from "./Settings/Settings";
import Docs from "./Docs/Docs";

const router = createBrowserRouter([
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
                path: "docs",
                Component: Docs,
            },
        ],
    },
]);

export default router;
