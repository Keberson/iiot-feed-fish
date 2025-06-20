import { Button, Flex, type FormInstance } from "antd";
import type React from "react";

import "./DynamicTableFilterFooter.css";

interface DynamicTableFilterFooterProps {
    form: FormInstance;
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

const DynamicTableFilterFooter: React.FC<DynamicTableFilterFooterProps> = ({
    form,
    filterState,
}) => {
    const onSave = () => {
        filterState[1](form.getFieldsValue());
    };

    const onReset = () => {
        form.resetFields();
        onSave();
    };

    return (
        <Flex className="dynamic-table-filter-footer">
            <Button type="primary" onClick={onSave}>
                Применить
            </Button>
            <Button onClick={onReset}>Сбросить</Button>
        </Flex>
    );
};

export default DynamicTableFilterFooter;
