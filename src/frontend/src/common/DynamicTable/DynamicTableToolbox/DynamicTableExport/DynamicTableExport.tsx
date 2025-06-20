import { ExportOutlined } from "@ant-design/icons";
import { Button, Flex, Tooltip } from "antd";
import { useForm } from "antd/es/form/Form";
import { useContext } from "react";

import SidenavContext from "#core/contexts/SidenavContext";

import type { IFormRenderItem } from "#common/FormRender/interface";
import FormRender from "#common/FormRender/FormRender";

import DynamicTableExportFooter from "./DynamicTableExportFooter/DynamicTableExportFooter";

interface DynamicTableExportProps {
    schema: IFormRenderItem[];
}

const DynamicTableExport: React.FC<DynamicTableExportProps> = ({ schema }) => {
    const { open, close } = useContext(SidenavContext);
    const [form] = useForm();

    const onExport = () => {
        open({
            content: (
                <Flex>
                    <FormRender schema={schema} form={form} />
                </Flex>
            ),
            props: {
                title: "Экспорт",
                onClose: () => close(),
                footer: <DynamicTableExportFooter form={form} />,
            },
        });
    };

    return (
        <Tooltip title="Экспорт">
            <Button type="primary" onClick={onExport}>
                <ExportOutlined />
            </Button>
        </Tooltip>
    );
};

export default DynamicTableExport;
