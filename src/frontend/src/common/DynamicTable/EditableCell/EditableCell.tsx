import { Flex, Form, Input, Select, type GetRef } from "antd";
import type { DefaultOptionType } from "antd/es/select";
import { useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { get } from "lodash";

import EditableContext from "#core/contexts/EditableContext";

import "./EditableCell.css";

interface EditableCellProps<T> {
    title: ReactNode;
    editable: boolean;
    dataIndex: keyof T;
    record: T;
    handleSave: (partialRecord: unknown, record: T) => void;
    editType?: "input" | "select";
    inputType?: "number" | "text";
    options?: DefaultOptionType[];
}

const EditableCell = <T,>({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    editType,
    inputType,
    options,
    ...restProps
}: React.PropsWithChildren<EditableCellProps<T>>): React.ReactElement => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef<GetRef<typeof Input>>(null);
    const selectRef = useRef<GetRef<typeof Select>>(null);
    const form = useContext(EditableContext)!;

    useEffect(() => {
        if (editing) {
            inputRef.current?.focus();
            selectRef.current?.focus();
        }
    }, [editing]);

    const toggleEdit = () => {
        setEditing(!editing);

        const value = get(record, dataIndex.toString());

        form.setFieldsValue({ [dataIndex]: value });
    };

    const save = async () => {
        try {
            const values = await form.validateFields();

            toggleEdit();
            handleSave(values, record);
        } catch (errInfo) {
            console.error("Save failed:", errInfo);
        }
    };

    let childNode = children;

    if (editable) {
        childNode =
            editing && editType ? (
                <Form.Item
                    className="editable-cell-wrapper"
                    name={dataIndex as string}
                    rules={[{ required: true, message: `${title} обязательно к заполнению.` }]}
                >
                    {editType === "input" && (
                        <Input ref={inputRef} onPressEnter={save} onBlur={save} type={inputType} />
                    )}
                    {editType === "select" && (
                        <Select options={options} ref={selectRef} onBlur={save} onChange={save} />
                    )}
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
