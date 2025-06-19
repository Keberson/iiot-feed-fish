import type { ColumnType } from "antd/es/table";

import type { DynamicTableColumnType } from "#common/DynamicTable/types";

const prepareDynamicTableSchema = <T>(
    schema: DynamicTableColumnType<T>[],
    handleSave?: (row: T) => void
): ColumnType<T>[] => {
    return schema.map((col) => {
        if (!col.editable) {
            return col;
        }

        return {
            ...col,
            onCell: (record: T) => ({
                record,
                editable: col.editable,
                editType: col.editType,
                inputType: col.editType === "input" ? col.inputType : undefined,
                options: col.editType === "select" ? col.options : undefined,
                dataIndex: col.dataIndex,
                title: col.title ? String(col.title) : undefined,
                handleSave,
            }),
        };
    });
};

export default prepareDynamicTableSchema;
