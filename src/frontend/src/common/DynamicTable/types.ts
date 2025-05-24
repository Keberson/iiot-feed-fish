import type { TableProps } from "antd/es/table";

interface IDynamicTableColumntTypeCustom {
    editable?: boolean;
    dataIndex?: string;
}

export type DynamicTableColumnType<T> = Exclude<TableProps<T>["columns"], undefined>[number] &
    IDynamicTableColumntTypeCustom;
