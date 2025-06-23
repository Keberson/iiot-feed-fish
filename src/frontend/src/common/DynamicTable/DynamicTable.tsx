import { type ReactNode } from "react";
import { Empty, Flex, Pagination, Table, type FormInstance } from "antd";

import prepareDynamicTableSchema from "#core/functions/prepareDynamicTableSchema/prepareDynamicTableSchema";

import type { IFormRenderItem } from "#common/FormRender/interface";

import type { IPaginationResponse } from "#types/api.types";

import EditableRow from "./EditableRow/EditableRow";
import EditableCell from "./EditableCell/EditableCell";
import DynamicTableToolbox from "./DynamicTableToolbox/DynamicTableToolbox";

import type { DynamicTableColumnType } from "./types";

import "./DynamicTable.css";

interface DynamicTableProps<T, F = undefined> {
    filter?: IFormRenderItem[];
    filterState?: [F | undefined, React.Dispatch<React.SetStateAction<F | undefined>>];

    pagination?: IPaginationResponse;
    paginationState?: [[number, number], React.Dispatch<React.SetStateAction<[number, number]>>];

    exported?: IFormRenderItem[];
    exportForm?: FormInstance;

    columns: DynamicTableColumnType<T>[];
    data: T[];
    rowKey: keyof T;
    toolbox?: ReactNode;
    handleUpdateItem?: (partialItem: unknown, item: T) => void;
}

const DynamicTable = <T, F = undefined>({
    filter,
    filterState,

    pagination,
    paginationState,

    exported,

    columns,
    data,
    rowKey,
    toolbox,
    handleUpdateItem,
}: DynamicTableProps<T, F>): React.ReactElement => {
    return (
        <Flex vertical className="dynamic-table-wrapper">
            {filter && filterState && (
                <DynamicTableToolbox<F>
                    filter={filter}
                    filterState={filterState}
                    panel={toolbox}
                    exported={exported}
                />
            )}
            <Flex vertical className="dynamic-table-top-part">
                <Table
                    components={{ body: { row: EditableRow, cell: EditableCell } }}
                    rootClassName="dynamic-table"
                    columns={prepareDynamicTableSchema(columns, handleUpdateItem)}
                    dataSource={data}
                    rowKey={rowKey}
                    pagination={{ position: ["none"] }}
                    locale={{ emptyText: <Empty description="Нет данных" /> }}
                />
            </Flex>
            {pagination && paginationState && (
                <Pagination
                    total={pagination.total}
                    showSizeChanger
                    align="center"
                    current={paginationState[0][0]}
                    onChange={(page, pageSize) => paginationState[1]([page, pageSize])}
                />
            )}
        </Flex>
    );
};

export default DynamicTable;
