import { useRef, type RefObject } from "react";
import { Button, Flex, Pagination, Table } from "antd";

import useResizable from "#core/useResizable/useResizable";
import prepareDynamicTableSchema from "#core/prepareDynamicTableSchema/prepareDynamicTableSchema";

import EditableRow from "./EditableRow/EditableRow";
import EditableCell from "./EditableCell/EditableCell";

import type { DynamicTableColumnType } from "./types";

import "./DynamicTable.css";

interface DynamicTableProps<T> {
    filter?: boolean;
    pagination?: boolean;
    topRef?: RefObject<HTMLElement | null>;
    bottomRef?: RefObject<HTMLElement | null>;
    stretchFactor?: number;
    columns: DynamicTableColumnType<T>[];
    data: T[];
    rowKey: keyof T;
}

const DynamicTable = <T,>({
    filter = false,
    pagination = false,
    topRef,
    bottomRef,
    stretchFactor = 0.8,
    columns,
    data,
    rowKey,
}: DynamicTableProps<T>): React.ReactElement => {
    const { ref, height } = useResizable();
    const toolboxRef = useRef<HTMLElement>(null);

    const handleSave = (row: T) => {
        const newData = [...data];
        const index = newData.findIndex((item) => row[rowKey] === item[rowKey]);
        const item = newData[index];

        newData.splice(index, 1, {
            ...item,
            ...row,
        });

        console.log("Save", newData);
    };

    return (
        <Flex ref={ref} vertical className="paginated-table-wrapper">
            <Flex vertical className="paginated-table-top-part">
                {filter && (
                    <Flex ref={toolboxRef} className="paginated-table-toolbox">
                        <Button>123</Button>
                    </Flex>
                )}
                <Table
                    components={{ body: { row: EditableRow, cell: EditableCell } }}
                    rootClassName="paginated-table"
                    columns={prepareDynamicTableSchema(columns, handleSave)}
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
                />
            </Flex>
            {pagination && (
                <Pagination total={85} showSizeChanger align="center" defaultCurrent={1} />
            )}
        </Flex>
    );
};

export default DynamicTable;
