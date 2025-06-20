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
    filterState?: [
        (
            | {
                  pool: string;
                  feed: string;
                  weight: [number, number];
              }
            | undefined
        ),
        React.Dispatch<
            React.SetStateAction<
                | {
                      pool: string;
                      feed: string;
                      weight: [number, number];
                  }
                | undefined
            >
        >
    ];
    searchable?: boolean;
    exported?: IFormRenderItem[];
    exportForm?: FormInstance;
    panel?: React.ReactNode;
}

const DynamicTableToolbox: React.FC<ToolboxProps> = ({
    ref,
    filter,
    filterState,
    searchable,
    exported,
    exportForm,
    panel,
}) => {
    return (
        <Flex ref={ref} className="dynamic-table-toolbox-panel">
            {panel && panel}
            <Flex className="dynamic-table-toolbox">
                {filter && filterState && <DynamicTableFilter schema={filter} filterState={filterState} />}
                {searchable && <DynamicTableSearch />}
                {exported && exportForm && (
                    <DynamicTableExport schema={exported} form={exportForm} />
                )}
            </Flex>
        </Flex>
    );
};

export default DynamicTableToolbox;
