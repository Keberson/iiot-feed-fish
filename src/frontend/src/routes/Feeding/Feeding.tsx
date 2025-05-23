import { Typography } from "antd";

import PaginatedTable from "../../common/PaginatedTable/PaginatedTable";

import "./Feeding.css";

const { Title } = Typography;

const Feeding = () => {
    return (
        <>
            <Title level={3}>Управление кормлением</Title>
            <PaginatedTable />
        </>
    );
};

export default Feeding;
