import { Flex } from "antd";
import type React from "react";

import type { IFormRenderItem } from "#common/FormRender/interface";

import DynamicTableFilter from "./DynamicTableFilter/DynamicTableFilter";
import DynamicTableSearch from "./DynamicTableSearch/DynamicTableSearch";
import DynamicTableExport from "./DynamicTableExport/DynamicTableExport";

import "./DynamicTableToolbox.css";

interface ToolboxProps<F = undefined> {
    ref?: React.Ref<HTMLElement>;
    filter?: IFormRenderItem[];
    filterState?: [F | undefined, React.Dispatch<React.SetStateAction<F | undefined>>];
    searchable?: boolean;
    exported?: IFormRenderItem[];
    panel?: React.ReactNode;
}

const DynamicTableToolbox = <F = undefined,>({
    ref,
    filter,
    filterState,
    searchable,
    exported,
    panel,
}: ToolboxProps<F>): React.ReactElement => {
    return (
        <Flex ref={ref} className="dynamic-table-toolbox-panel">
            {panel && panel}
            <Flex className="dynamic-table-toolbox">
                {filter && filterState && (
                    <DynamicTableFilter schema={filter} filterState={filterState} />
                )}
                {searchable && <DynamicTableSearch />}
                {exported && <DynamicTableExport schema={exported} />}
            </Flex>
        </Flex>
    );
};

export default DynamicTableToolbox;
