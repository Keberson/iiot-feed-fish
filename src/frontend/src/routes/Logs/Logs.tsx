import { useRef, useState } from "react";
import { Typography } from "antd";

import DynamicTable from "#common/DynamicTable/DynamicTable";

import { useRTKEffects } from "#core/hooks/useRTKEffects/useRTKEffects";

import type { ILogFilter, ILogTableItem } from "#types/log.types";

import { useGetLogsListQuery } from "#services/logs";

import { columns, filterSchema } from "./props";

import "./Logs.css";

const { Title } = Typography;

const Logs = () => {
    const [pagination, setPagination] = useState<[number, number]>([1, 10]);
    const [filter, setFilter] = useState<ILogFilter>();
    const titleRef = useRef<HTMLElement>(null);
    const { data, isLoading, error } = useGetLogsListQuery({
        pagination: { current: pagination[0], itemsPerPage: pagination[1] },
        filter,
    });

    useRTKEffects({ isLoading, error }, "LOG_LIST");

    return (
        <>
            <Title ref={titleRef} level={3}>
                Логи
            </Title>
            <DynamicTable<ILogTableItem, ILogFilter>
                filter={filterSchema}
                filterState={[filter, setFilter]}
                topRef={titleRef}
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
