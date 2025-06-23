import { useRef, type ReactNode, type RefObject } from "react";
import { Empty, Flex, Pagination, Table, type FormInstance } from "antd";

import useResizable from "#core/hooks/useResizable/useResizable";
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

    topRef?: RefObject<HTMLElement | null>;
    bottomRef?: RefObject<HTMLElement | null>;
    stretchFactor?: number;

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

    topRef,
    bottomRef,
    stretchFactor = 0.75,

    columns,
    data,
    rowKey,
    toolbox,
    handleUpdateItem,
}: DynamicTableProps<T, F>): React.ReactElement => {
    const { ref, height } = useResizable();
    const toolboxRef = useRef<HTMLElement>(null);

    return (
        <Flex ref={ref} vertical className="dynamic-table-wrapper">
            <Flex vertical className="dynamic-table-top-part">
                {filter && filterState && (
                    <DynamicTableToolbox<F>
                        filter={filter}
                        filterState={filterState}
                        panel={toolbox}
                        exported={exported}
                    />
                )}
                <Table
                    components={{ body: { row: EditableRow, cell: EditableCell } }}
                    rootClassName="dynamic-table"
                    columns={prepareDynamicTableSchema(columns, handleUpdateItem)}
                    dataSource={data}
                    rowKey={rowKey}
                    pagination={{ position: ["none"] }}
                    scroll={{
                        y:
                            (height -
                                (filter ? (toolboxRef.current?.clientHeight || 0) + 20 : 0) -
                                (pagination ? 32 + 20 : 0) -
                                (topRef?.current?.clientHeight || 0) -
                                (bottomRef?.current?.clientHeight || 0)) *
                            stretchFactor,
                    }}
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
