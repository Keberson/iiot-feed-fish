import { useState } from "react";
import { Typography } from "antd";

import DynamicTable from "#common/DynamicTable/DynamicTable";

import type { ILogFilter, ILogTableItem } from "#types/log.types";

import { useGetLogsListQuery } from "#services/api/logs.api";

import { columns, filterSchema } from "./props";

import "./Logs.css";

const { Title } = Typography;

const Logs = () => {
    const [pagination, setPagination] = useState<[number, number]>([1, 10]);
    const [filter, setFilter] = useState<ILogFilter>();
    const { data } = useGetLogsListQuery({
        pagination: { current: pagination[0], itemsPerPage: pagination[1] },
        filter,
    });

    return (
        <>
            <Title level={3}>Логи</Title>
            <DynamicTable<ILogTableItem, ILogFilter>
                filter={filterSchema}
                filterState={[filter, setFilter]}
                columns={columns}
                pagination={data}
                paginationState={[pagination, setPagination]}
                data={data?.data || []}
                rowKey="id"
            />
        </>
    );
};

export default Logs;
