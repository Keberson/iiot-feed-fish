import type { SliderSingleProps } from "antd";
import type { Rule } from "antd/es/form";
import type { DefaultOptionType } from "antd/es/select";

interface IFormRenderRequest {
    url: string;
    query: object[];
}

interface IFormRenderItemBase {
    name: string;
    label: string | React.ReactNode;
    validators?: Rule[];
    initValue?: unknown;
    request?: IFormRenderRequest;
    hidden?: boolean;
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
}

export interface IFormRenderSelect extends IFormRenderItemBase {
    type: "select";
    options: DefaultOptionType[];
    initValue?: string;
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

export type IFormRenderItem =
    | IFormRenderItemText
    | IFormRenderItemTitle
    | IFormRenderInput
    | IFormRenderSelect
    | IFormRenderCheckbox
    | IFormRenderSwitch
    | IFormRenderDivider
    | IFormRenderSlider;
