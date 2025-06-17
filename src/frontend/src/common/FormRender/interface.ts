import type { SliderSingleProps } from "antd";
import type { Rule } from "antd/es/form";
import type { DefaultOptionType } from "antd/es/select";

interface IFormRenderRequest {
    url: string;
    query: object[];
}

interface IFormRenderDependecy {
    controlName: string;
    compareValue: unknown;
}

interface IFormRenderDependecies {
    hide?: IFormRenderDependecy;
}

interface IFormRenderItemBase {
    name: string;
    label: string | React.ReactNode;
    validators?: Rule[];
    initValue?: unknown;
    request?: IFormRenderRequest;
    hidden?: boolean;
    dependencies?: IFormRenderDependecies;
    required?: boolean;
    disabled?: boolean;
}

export interface IFormRenderItemText {
    type: "text";
    initValue: string;
}

export interface IFormRenderItemTitle {
    type: "title";
    initValue: string;
    level?: 1 | 2 | 3 | 4 | 5;
}

export interface IFormRenderInput extends IFormRenderItemBase {
    type: "input";
    subtype?: "number" | "text" | "password";
    initValue?: string;
    placeholder?: string;
}

export interface IFormRenderSelect extends IFormRenderItemBase {
    type: "select";
    options: DefaultOptionType[];
    initValue?: string;
    placeholder?: string;
}

export interface IFormRenderCheckbox extends IFormRenderItemBase {
    type: "checkbox";
    initValue?: boolean;
}

export interface IFormRenderSwitch extends IFormRenderItemBase {
    type: "switch";
    initValue?: boolean;
}

export interface IFormRenderDivider {
    type: "divider";
}

export interface IFormRenderSlider extends IFormRenderItemBase {
    type: "slider";
    marks: SliderSingleProps["marks"];
    range?: boolean;
}

export interface IFormRenderTime extends IFormRenderItemBase {
    type: "time";
    initValue?: string;
    placeholder?: string;
}

export type IFormRenderItem =
    | IFormRenderItemText
    | IFormRenderItemTitle
    | IFormRenderInput
    | IFormRenderSelect
    | IFormRenderCheckbox
    | IFormRenderSwitch
    | IFormRenderDivider
    | IFormRenderSlider
    | IFormRenderTime;
