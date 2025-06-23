import { Button, Flex, type FormInstance } from "antd";

import { useLazyDownloadCsvQuery } from "#services/feeding";

import { useRTKEffects } from "#core/hooks/useRTKEffects/useRTKEffects";

import "./DynamicTableExportFooter.css";

interface DynamicTableExportFooterProps {
    form: FormInstance;
}

const DynamicTableExportFooter: React.FC<DynamicTableExportFooterProps> = ({ form }) => {
    const [download, options] = useLazyDownloadCsvQuery();

    useRTKEffects(options, "DOWNLOAD_FEEDING", "UPDATE", "Успешно экспортировано");

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
