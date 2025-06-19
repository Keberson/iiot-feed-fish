import type { TableProps } from "antd/es/table";

interface IDynamicTableColumnTypeCustom {
    dataIndex?: string;
}

interface IDynamicTableColumnTypeCustomEditable {
    editable: boolean;
    
}

export type DynamicTableColumnType<T> = Exclude<TableProps<T>["columns"], undefined>[number] &
    IDynamicTableColumnTypeCustom &
    (IDynamicTableColumnTypeCustomEditable | { editable?: never });
