import { Button, Drawer } from "antd";
import { useForm } from "antd/es/form/Form";
import { useContext } from "react";

import SidenavContext from "#core/contexts/SidenavContext";

import FormRender from "#common/FormRender/FormRender";
import type { IFormRenderItem } from "#common/FormRender/interface";

import DynamicTableFilterFooter from "./DynamicTableFilterFooter/DynamicTableFilterFooter";

import "./DynamicTableFilter.css";

interface DynamicTableFilterProps {
    schema: IFormRenderItem[];
    filterState: [
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
}

const DynamicTableFilter: React.FC<DynamicTableFilterProps> = ({ schema, filterState }) => {
    const { open, close } = useContext(SidenavContext);
    const [form] = useForm();

    const openFilter = () => {
        open({
            content: <FormRender schema={schema} form={form} />,
            props: {
                title: "Фильтрация",
                onClose: () => close(),
                footer: <DynamicTableFilterFooter form={form} filterState={filterState} />,
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
