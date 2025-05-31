import { Button, Drawer } from "antd";
import { useState } from "react";

import FormRender from "#common/FormRender/FormRender";
import type { IFormRenderItem } from "#common/FormRender/interface";

import DynamicTableFilterFooter from "./DynamicTableFilterFooter/DynamicTableFilterFooter";

import "./DynamicTableFilter.css";

interface DynamicTableFilterProps {
    schema: IFormRenderItem[];
}

const DynamicTableFilter: React.FC<DynamicTableFilterProps> = ({ schema }) => {
    const [openFilter, setOpenFilter] = useState(false);

    return (
        <>
            <Button onClick={() => setOpenFilter(true)}>Фильтр</Button>
            <Drawer
                title="Фильтрация"
                open={openFilter}
                onClose={() => setOpenFilter(false)}
                footer={<DynamicTableFilterFooter />}
            >
                <FormRender schema={schema} />
            </Drawer>
        </>
    );
};

export default DynamicTableFilter;
