import type React from "react";
import moment from "moment";
import dayjs from "dayjs";
import { DatePicker as AntDatePicker } from "antd";
import type { DatePickerProps as AntDatePickerProps } from "antd";

import "./DatePicker.css";

interface DatePickerProps {
    value?: string;
    onChange?: (value: string | null) => void;
    placeholder?: string;
    format?: string;
    presets?: AntDatePickerProps["presets"];
    minValue?: string;
    maxValue?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
    value,
    onChange,
    placeholder,
    format,
    presets,
    minValue,
    maxValue,
}) => {
    const momentValue = value ? moment(value, "YYYY-MM-DD") : null;
    const formatDate = "YYYY-MM-DD";

    const handleChange = (date: moment.Moment | null) => {
        if (onChange) {
            onChange(date ? date.format("YYYY-MM-DD") : null);
        }
    };

    return (
        <AntDatePicker
            value={momentValue}
            onChange={handleChange}
            format={format}
            placeholder={placeholder}
            presets={presets}
            minDate={dayjs(minValue, formatDate)}
            maxDate={dayjs(maxValue, formatDate)}
        />
    );
};

export default DatePicker;
