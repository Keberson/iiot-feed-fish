import { Button, Flex, type FormInstance } from "antd";

import { useLazyDownloadCsvQuery } from "#services/api/feeding.api";

import "./DynamicTableExportFooter.css";

interface DynamicTableExportFooterProps {
    form: FormInstance;
}

const DynamicTableExportFooter: React.FC<DynamicTableExportFooterProps> = ({ form }) => {
    const [download] = useLazyDownloadCsvQuery();

    const onClick = () => {
        const { weight, ...otherData } = form.getFieldsValue();

        download({
            minWeight: weight ? weight[0] : undefined,
            maxWeight: weight ? weight[1] : undefined,
            ...otherData,
        });
    };

    const onReset = () => {
        form.resetFields(undefined);
    };

    return (
        <Flex className="dynamic-table-filter-footer">
            <Button type="primary" onClick={onClick}>
                Экспортировать
            </Button>
            <Button onClick={onReset}>Сбросить</Button>
        </Flex>
    );
};

export default DynamicTableExportFooter;
