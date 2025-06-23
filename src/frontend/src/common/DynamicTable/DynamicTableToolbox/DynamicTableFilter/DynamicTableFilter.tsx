import { Button } from "antd";
import { useForm } from "antd/es/form/Form";
import React, { useContext } from "react";

import SidenavContext from "#core/contexts/SidenavContext";

import FormRender from "#common/FormRender/FormRender";
import type { IFormRenderItem } from "#common/FormRender/interface";

import DynamicTableFilterFooter from "./DynamicTableFilterFooter/DynamicTableFilterFooter";

import "./DynamicTableFilter.css";

interface DynamicTableFilterProps<F = undefined> {
    schema: IFormRenderItem[];
    filterState: [F | undefined, React.Dispatch<React.SetStateAction<F | undefined>>];
}

const DynamicTableFilter = <F = undefined,>({
    schema,
    filterState,
}: DynamicTableFilterProps<F>): React.ReactElement => {
    const { open, close } = useContext(SidenavContext);
    const [form] = useForm();

    const openFilter = () => {
        open({
            content: <FormRender schema={schema} form={form} />,
            props: {
                title: "Фильтрация",
                onClose: () => close(),
                footer: <DynamicTableFilterFooter<F> form={form} filterState={filterState} />,
            },
        });
    };

    return <Button onClick={openFilter}>Фильтр</Button>;
};

export default DynamicTableFilter;
