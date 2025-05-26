import { Button, Flex } from "antd";

import "./DynamicTableFilterFooter.css";

const DynamicTableFilterFooter = () => {
    return (
        <Flex className="dynamic-table-filter-footer">
            <Button type="primary">Сохранить</Button>
            <Button>Сбросить</Button>
        </Flex>
    );
};

export default DynamicTableFilterFooter;
