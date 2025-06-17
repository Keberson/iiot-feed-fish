import { Flex, Form, Input, type InputRef } from "antd";
import { useContext, useEffect, useRef, useState, type ReactNode } from "react";

import EditableContext from "#core/contexts/EditableContext";

import "./EditableCell.css";

interface EditableCellProps<T> {
    title: ReactNode;
    editable: boolean;
    dataIndex: keyof T;
    record: T;
    handleSave: (record: T) => void;
}

const EditableCell = <T,>({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
}: React.PropsWithChildren<EditableCellProps<T>>): React.ReactElement => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef<InputRef>(null);
    const form = useContext(EditableContext)!;

    useEffect(() => {
        if (editing) {
            inputRef.current?.focus();
        }
    }, [editing]);

    const toggleEdit = () => {
        setEditing(!editing);
        console.log(record, dataIndex, record[dataIndex]);
        form.setFieldsValue({ [dataIndex]: record[dataIndex] });
    };

    const save = async () => {
        try {
            const values = await form.validateFields();

            toggleEdit();
            handleSave({ ...record, ...values });
        } catch (errInfo) {
            console.error("Save failed:", errInfo);
        }
    };

    let childNode = children;

    if (editable) {
        childNode = editing ? (
            <Form.Item
                className="editable-cell-wrapper"
                name={dataIndex as string}
                rules={[{ required: true, message: `${title} обязательно к заполнению.` }]}
            >
                <Input ref={inputRef} onPressEnter={save} onBlur={save} />
            </Form.Item>
        ) : (
            <Flex className="editable-cell-value-wrap" onClick={toggleEdit}>
                {children}
            </Flex>
        );
    }

    return <td {...restProps}>{childNode}</td>;
};

export default EditableCell;
