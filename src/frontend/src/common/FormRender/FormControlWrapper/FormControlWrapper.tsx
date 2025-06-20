import { Form, type FormInstance } from "antd";
import { useWatch } from "antd/es/form/Form";
import type React from "react";
import { useEffect, useState, type ReactNode } from "react";

import type {
    IFormRenderDivider,
    IFormRenderItem,
    IFormRenderItemText,
    IFormRenderItemTitle,
} from "../interface";

import "./FormControlWrapper.css";

interface FormControlWrapperProps {
    item: Exclude<IFormRenderItem, IFormRenderItemText | IFormRenderItemTitle | IFormRenderDivider>;
    form: FormInstance;
    children: ReactNode;
}

const FormControlWrapper: React.FC<FormControlWrapperProps> = ({ item, form, children }) => {
    const [hidden, setHidden] = useState<boolean>(!!item.hidden);
    const needDependecies = item.dependencies ? undefined : "";
    const value = useWatch(needDependecies, form);

    useEffect(() => {
        if (item.dependencies?.hide && value) {
            setHidden(
                value[item.dependencies.hide.controlName] !== item.dependencies.hide.compareValue
            );
        }
    }, [value]);

    return (
        <Form.Item
            label={item.label}
            name={item.name}
            rules={hidden ? undefined : item.validators}
            initialValue={item.initValue}
            className={`${hidden ? "form-item-hidden" : ""} ${
                item.type === "slider" && "form-slider-wrapper"
            }`}
            required={hidden ? undefined : item.required}
        >
            {children}
        </Form.Item>
    );
};

export default FormControlWrapper;
