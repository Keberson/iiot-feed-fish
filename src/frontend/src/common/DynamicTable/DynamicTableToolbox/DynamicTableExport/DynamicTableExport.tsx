import { ExportOutlined } from "@ant-design/icons";
import { Button, Flex, Tooltip, type FormInstance } from "antd";
import { useContext } from "react";

import SidenavContext from "#core/contexts/SidenavContext";

import type { IFormRenderItem } from "#common/FormRender/interface";
import FormRender from "#common/FormRender/FormRender";

import DynamicTableExportFooter from "./DynamicTableExportFooter/DynamicTableExportFooter";

interface DynamicTableExportProps {
    schema: IFormRenderItem[];
    form: FormInstance;
}

const DynamicTableExport: React.FC<DynamicTableExportProps> = ({ schema, form }) => {
    const { open, close } = useContext(SidenavContext);

    const onExport = () => {
        open({
            content: (
                <Flex>
                    <FormRender schema={schema} form={form} />
                </Flex>
            ),
            props: {
                title: "Фильтрация",
                onClose: () => close(),
                footer: <DynamicTableExportFooter />,
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
