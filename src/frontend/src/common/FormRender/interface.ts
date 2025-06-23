import type { DatePickerProps, SliderSingleProps, TimeRangePickerProps } from "antd";
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
    label?: string | React.ReactNode;
    validators?: Rule[];
    initValue?: unknown;
    request?: IFormRenderRequest;
    hidden?: boolean;
    dependencies?: IFormRenderDependecies;
    required?: boolean;
    disabled?: boolean;
}

export interface IFormRenderBase {
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
    initValue?: string | null;
    placeholder?: string;
    addonBefore?: ReactNode;
}

export interface IFormRenderSelect extends IFormRenderItemBase, IFormRenderBase {
    type: "select";
    options: DefaultOptionType[];
    initValue?: string;
    placeholder?: string;
    allowClear?: boolean;
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
    min: number;
    max: number;
}

export interface IFormRenderTime extends IFormRenderItemBase, IFormRenderBase {
    type: "time";
    initValue?: string;
    placeholder?: string;
}

export interface IFormRenderDateRange extends IFormRenderItemBase, IFormRenderBase {
    type: "dateRange";
    placeholder?: [string, string];
    presets?: TimeRangePickerProps["presets"];
    format?: string;
    allowEmpty?: [boolean, boolean];
}

export interface IFormRenderDate extends IFormRenderItemBase, IFormRenderBase {
    type: "date";
    placeholder?: string;
    presets?: DatePickerProps["presets"];
    format?: string;
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
    | IFormRenderTime
    | IFormRenderDateRange
    | IFormRenderDate;
