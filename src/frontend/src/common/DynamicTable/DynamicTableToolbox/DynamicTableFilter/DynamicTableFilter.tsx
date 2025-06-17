import { Button, Drawer, type FormInstance } from "antd";
import { useContext } from "react";

import FormRender from "#common/FormRender/FormRender";
import type { IFormRenderItem } from "#common/FormRender/interface";

import DynamicTableFilterFooter from "./DynamicTableFilterFooter/DynamicTableFilterFooter";

import "./DynamicTableFilter.css";
import SidenavContext from "#core/contexts/SidenavContext";

interface DynamicTableFilterProps {
    schema: IFormRenderItem[];
    form: FormInstance;
}

const DynamicTableFilter: React.FC<DynamicTableFilterProps> = ({ schema, form }) => {
    const { open, close } = useContext(SidenavContext);

    const openFilter = () => {
        open({
            content: <FormRender schema={schema} form={form} />,
            props: {
                title: "Фильтрация",
                onClose: () => close(),
                footer: <DynamicTableFilterFooter />,
            },
        });
    };

    return (
        <>
            <Button onClick={openFilter}>Фильтр</Button>
            <Drawer></Drawer>
        </>
    );
};

export default DynamicTableFilter;
