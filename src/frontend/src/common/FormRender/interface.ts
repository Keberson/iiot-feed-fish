import type { SliderSingleProps } from "antd";
import type { Rule } from "antd/es/form";
import type { DefaultOptionType } from "antd/es/select";
import type { ReactNode } from "react";

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
    label: string | React.ReactNode;
    validators?: Rule[];
    initValue?: unknown;
    request?: IFormRenderRequest;
    hidden?: boolean;
    dependencies?: IFormRenderDependecies;
    required?: boolean;
    disabled?: boolean;
}

interface IFormRenderBase {
    name: string;
}

export interface IFormRenderItemText extends IFormRenderBase {
    type: "text";
    initValue: string;
}

export interface IFormRenderItemTitle extends IFormRenderBase {
    type: "title";
    initValue: string;
    level?: 1 | 2 | 3 | 4 | 5;
}

export interface IFormRenderInput extends IFormRenderItemBase, IFormRenderBase {
    type: "input";
    subtype?: "number" | "text" | "password";
    initValue?: string;
    placeholder?: string;
    addonBefore?: ReactNode;
}

export interface IFormRenderSelect extends IFormRenderItemBase, IFormRenderBase {
    type: "select";
    options: DefaultOptionType[];
    initValue?: string;
    placeholder?: string;
}

export interface IFormRenderCheckbox extends IFormRenderItemBase, IFormRenderBase {
    type: "checkbox";
    initValue?: boolean;
}

export interface IFormRenderSwitch extends IFormRenderItemBase, IFormRenderBase {
    type: "switch";
    initValue?: boolean;
}

export interface IFormRenderDivider extends IFormRenderBase {
    type: "divider";
}

export interface IFormRenderSlider extends IFormRenderItemBase, IFormRenderBase {
    type: "slider";
    marks: SliderSingleProps["marks"];
    range?: boolean;
}

export interface IFormRenderTime extends IFormRenderItemBase, IFormRenderBase {
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
