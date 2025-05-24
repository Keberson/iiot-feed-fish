import { Flex } from "antd";
import type React from "react";

import DynamicTableFilter from "./DynamicTableFilter/DynamicTableFilter";
import DynamicTableSearch from "./DynamicTableSearch/DynamicTableSearch";

import "./DynamicTableToolbox.css";
import type { IFormRenderItem } from "#common/FormRender/interface";

interface ToolboxProps {
    ref?: React.Ref<HTMLElement>;
    filter?: IFormRenderItem[];
    searchable?: boolean;
    panel?: React.ReactNode;
}

const DynamicTableToolbox: React.FC<ToolboxProps> = ({ ref, filter, searchable, panel }) => {
    return (
        <Flex ref={ref} className="dynamic-table-toolbox-panel">
            {panel && panel}
            <Flex className="dynamic-table-toolbox">
                {filter && <DynamicTableFilter schema={filter} />}
                {searchable && <DynamicTableSearch />}
            </Flex>
        </Flex>
    );
};

export default DynamicTableToolbox;
