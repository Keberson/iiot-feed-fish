import {
    Checkbox,
    Divider,
    Form,
    Input,
    Select,
    Slider,
    Switch,
    TimePicker,
    Typography,
    type FormInstance,
} from "antd";
import type { IFormRenderItem } from "./interface";

import FormControlWrapper from "./FormControlWrapper/FormControlWrapper";
import DatePicker from "./controls/DatePicker/DatePicker";

import "./FormRender.css";
import DateRange from "./controls/DateRange/DateRange";

const { Title, Text } = Typography;

interface FormRenderProps {
    schema: IFormRenderItem[];
    form: FormInstance;
}

const FormRender: React.FC<FormRenderProps> = ({ schema, form }) => {
    return (
        <Form form={form} layout="vertical" className="form-wrapper" autoComplete="off">
            {schema.map((item) => {
                if (item.type === "title") {
                    return (
                        <Title level={item.level} key={item.name}>
                            {item.initValue}
                        </Title>
                    );
                }

                if (item.type === "text") {
                    return <Text key={item.name}>{item.initValue}</Text>;
                }

                if (item.type === "divider") {
                    return <Divider key={item.name} />;
                }

                return (
                    <FormControlWrapper form={form} item={item} key={item.name}>
                        {item.type === "input" && (
                            <Input
                                type={item.subtype}
                                disabled={item.disabled}
                                placeholder={item.placeholder}
                                addonBefore={item.addonBefore}
                                autoComplete="new-password"
                            />
                        )}
                        {item.type === "checkbox" && <Checkbox disabled={item.disabled} />}
                        {item.type === "switch" && <Switch disabled={item.disabled} />}
                        {item.type === "select" && (
                            <Select
                                options={item.options}
                                disabled={item.disabled}
                                placeholder={item.placeholder}
                                allowClear={item.allowClear}
                            />
                        )}
                        {item.type === "slider" && (
                            <>
                                {item.range && (
                                    <Slider
                                        disabled={item.disabled}
                                        range={item.range}
                                        marks={item.marks}
                                        min={item.min}
                                        max={item.max}
                                        defaultValue={[item.min, item.max]}
                                    />
                                )}
                                {!item.range && (
                                    <Slider
                                        disabled={item.disabled}
                                        range={item.range}
                                        marks={item.marks}
                                        min={item.min}
                                        max={item.max}
                                        defaultValue={item.min}
                                    />
                                )}
                            </>
                        )}
                        {item.type === "time" && (
                            <TimePicker
                                disabled={item.disabled}
                                placeholder={item.placeholder}
                                format="HH:mm"
                                showSecond={false}
                                minuteStep={30}
                                use12Hours={false}
                                className="form-item-timepicker"
                            />
                        )}
                        {item.type === "dateRange" && (
                            <DateRange
                                placeholder={item.placeholder}
                                presets={item.presets}
                                allowEmpty={item.allowEmpty}
                                format={item.format}
                            />
                        )}
                        {item.type === "date" && (
                            <DatePicker
                                placeholder={item.placeholder}
                                format={item.format}
                                presets={item.presets}
                            />
                        )}
                    </FormControlWrapper>
                );
            })}
        </Form>
    );
};

export default FormRender;
