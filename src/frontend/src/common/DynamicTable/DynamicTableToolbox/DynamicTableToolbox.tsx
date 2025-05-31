import { Flex } from "antd";
import type React from "react";

import type { IFormRenderItem } from "#common/FormRender/interface";

import DynamicTableFilter from "./DynamicTableFilter/DynamicTableFilter";
import DynamicTableSearch from "./DynamicTableSearch/DynamicTableSearch";
import DynamicTableExport from "./DynamicTableExport/DynamicTableExport";

import "./DynamicTableToolbox.css";

interface ToolboxProps {
    ref?: React.Ref<HTMLElement>;
    filter?: IFormRenderItem[];
    searchable?: boolean;
    exported?: boolean;
    panel?: React.ReactNode;
}

const DynamicTableToolbox: React.FC<ToolboxProps> = ({
    ref,
    filter,
    searchable,
    exported,
    panel,
}) => {
    return (
        <Flex ref={ref} className="dynamic-table-toolbox-panel">
            {panel && panel}
            <Flex className="dynamic-table-toolbox">
                {filter && <DynamicTableFilter schema={filter} />}
                {searchable && <DynamicTableSearch />}
                {exported && <DynamicTableExport />}
            </Flex>
        </Flex>
    );
};

export default DynamicTableToolbox;
