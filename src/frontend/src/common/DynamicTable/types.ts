import type { DefaultOptionType } from "antd/es/select";
import type { TableProps } from "antd/es/table";

type IDynamicTableColumnTypeCustomEditable = {
    editable: boolean;
} & (IDynamicTableEditableInput | IDynamicTableEditableSelect);

interface IDynamicTableEditableInput {
    editType: "input";
    inputType: "text" | "number";
}

interface IDynamicTableEditableSelect {
    editType: "select";
    options: DefaultOptionType[];
}

interface IDynamicTableColumnTypeCustom {
    dataIndex?: string;
}

export type DynamicTableColumnType<T> = Exclude<TableProps<T>["columns"], undefined>[number] &
    IDynamicTableColumnTypeCustom &
    (IDynamicTableColumnTypeCustomEditable | { editable?: never });
