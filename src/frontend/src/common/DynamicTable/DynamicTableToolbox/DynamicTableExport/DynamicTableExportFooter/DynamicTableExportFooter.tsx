import { Button, Flex } from "antd";

import "./DynamicTableExportFooter.css";

const DynamicTableExportFooter = () => {
    return (
        <Flex className="dynamic-table-filter-footer">
            <Button type="primary">Экспортировать</Button>
            <Button>Сбросить</Button>
        </Flex>
    );
};

export default DynamicTableExportFooter;
