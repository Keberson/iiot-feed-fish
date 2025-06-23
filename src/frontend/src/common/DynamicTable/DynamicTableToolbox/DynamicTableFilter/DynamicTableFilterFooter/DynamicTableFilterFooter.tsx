import { Button, Flex, type FormInstance } from "antd";
import type React from "react";

import "./DynamicTableFilterFooter.css";

interface DynamicTableFilterFooterProps<F = undefined> {
    form: FormInstance;
    filterState: [F | undefined, React.Dispatch<React.SetStateAction<F | undefined>>];
}

const DynamicTableFilterFooter = <F = undefined,>({
    form,
    filterState,
}: DynamicTableFilterFooterProps<F>): React.ReactElement => {
    const onSave = () => {
        console.log(form.getFieldsValue());
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
