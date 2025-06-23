import { DatePicker, type TimeRangePickerProps } from "antd";
import dayjs, { Dayjs } from "dayjs";

import "./DateRange.css";

const { RangePicker } = DatePicker;

interface DateRangeProps {
    value?: [string, string];
    onChange?: (value: [string, string] | null) => void;
    placeholder?: [string, string];
    presets?: TimeRangePickerProps["presets"];
    format?: string;
    allowEmpty?: [boolean, boolean];
}

const DateRange: React.FC<DateRangeProps> = ({
    value,
    onChange,
    placeholder,
    presets,
    format,
    allowEmpty,
}) => {
    const formatControl = "YYYY-MM-DD";
    const dayjsValue = value
        ? [
              value[0] ? dayjs(value[0], formatControl) : null,
              value[1] ? dayjs(value[1], formatControl) : null,
          ]
        : null;

    const handleChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        if (onChange) {
            if (!dates) {
                onChange(null);
                return;
            }

            const [start, end] = dates;
            onChange([
                start ? start.format(formatControl) : "",
                end ? end.format(formatControl) : "",
            ]);
        }
    };

    return (
        <RangePicker
            value={dayjsValue as [Dayjs, Dayjs]}
            onChange={handleChange}
            placeholder={placeholder}
            presets={presets}
            format={format}
            allowEmpty={allowEmpty}
            allowClear={true}
            className="form-date-range"
        />
    );
};

export default DateRange;
