import { Flex, type FormInstance } from "antd";
import type React from "react";

import type { IFormRenderItem } from "#common/FormRender/interface";

import DynamicTableFilter from "./DynamicTableFilter/DynamicTableFilter";
import DynamicTableSearch from "./DynamicTableSearch/DynamicTableSearch";
import DynamicTableExport from "./DynamicTableExport/DynamicTableExport";

import "./DynamicTableToolbox.css";

interface ToolboxProps {
    ref?: React.Ref<HTMLElement>;
    filter?: IFormRenderItem[];
    filterForm?: FormInstance;
    searchable?: boolean;
    exported?: IFormRenderItem[];
    exportForm?: FormInstance;
    panel?: React.ReactNode;
}

const DynamicTableToolbox: React.FC<ToolboxProps> = ({
    ref,
    filter,
    filterForm,
    searchable,
    exported,
    exportForm,
    panel,
}) => {
    return (
        <Flex ref={ref} className="dynamic-table-toolbox-panel">
            {panel && panel}
            <Flex className="dynamic-table-toolbox">
                {filter && filterForm && <DynamicTableFilter schema={filter} form={filterForm} />}
                {searchable && <DynamicTableSearch />}
                {exported && exportForm && (
                    <DynamicTableExport schema={exported} form={exportForm} />
                )}
            </Flex>
        </Flex>
    );
};

export default DynamicTableToolbox;
