import { useRef, type ReactNode, type RefObject } from "react";
import { Flex, Pagination, Table, type FormInstance } from "antd";

import useResizable from "#core/hooks/useResizable/useResizable";
import prepareDynamicTableSchema from "#core/functions/prepareDynamicTableSchema/prepareDynamicTableSchema";

import type { IFormRenderItem } from "#common/FormRender/interface";

import EditableRow from "./EditableRow/EditableRow";
import EditableCell from "./EditableCell/EditableCell";
import DynamicTableToolbox from "./DynamicTableToolbox/DynamicTableToolbox";

import type { DynamicTableColumnType } from "./types";

import "./DynamicTable.css";

interface DynamicTableProps<T> {
    filter?: IFormRenderItem[];
    filterForm?: FormInstance;
    pagination?: boolean;
    exported?: IFormRenderItem[];
    exportForm?: FormInstance;
    topRef?: RefObject<HTMLElement | null>;
    bottomRef?: RefObject<HTMLElement | null>;
    stretchFactor?: number;
    columns: DynamicTableColumnType<T>[];
    data: T[];
    rowKey: keyof T;
    toolbox?: ReactNode;
}

const DynamicTable = <T,>({
    filter,
    filterForm,
    pagination,
    exported,
    exportForm,
    topRef,
    bottomRef,
    stretchFactor = 0.7,
    columns,
    data,
    rowKey,
    toolbox,
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
        <Flex ref={ref} vertical className="dynamic-table-wrapper">
            <Flex vertical className="dynamic-table-top-part">
                {filter && filterForm && (
                    <DynamicTableToolbox
                        filter={filter}
                        filterForm={filterForm}
                        panel={toolbox}
                        exported={exported}
                        exportForm={exportForm}
                    />
                )}
                <Table
                    components={{ body: { row: EditableRow, cell: EditableCell } }}
                    rootClassName="dynamic-table"
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
