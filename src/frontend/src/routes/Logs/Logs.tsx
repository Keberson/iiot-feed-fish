import { useRef } from "react";
import { Typography } from "antd";

import DynamicTable from "#common/DynamicTable/DynamicTable";

import type { ILogTableItem } from "#types/log.types";

import { columns, filterSchema, mockData } from "./props";

const { Title } = Typography;

const Logs = () => {
    const titleRef = useRef<HTMLElement>(null);

    return (
        <>
            <Title ref={titleRef} level={3}>
                Логи
            </Title>
            <DynamicTable<ILogTableItem>
                filter={filterSchema}
                topRef={titleRef}
                columns={columns}
                data={mockData}
                rowKey="id"
            />
        </>
    );
};

export default Logs;
