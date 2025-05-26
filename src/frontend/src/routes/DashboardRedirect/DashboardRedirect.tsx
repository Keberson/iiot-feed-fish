import { Navigate } from "react-router";

const DashboardRedirect = () => {
    return <Navigate to="/dashboard/home" replace />;
};

export default DashboardRedirect;
