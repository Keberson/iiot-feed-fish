import { Form } from "antd";

import EditableContext from "#core/EditableContext/EditableContext";

import "./EditableRow.css";

const EditableRow = ({ ...props }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
};

export default EditableRow;
