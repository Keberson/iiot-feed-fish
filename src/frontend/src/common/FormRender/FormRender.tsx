import {
    Checkbox,
    Divider,
    Flex,
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

import "./FormRender.css";
import FormControlWrapper from "./FormControlWrapper/FormControlWrapper";

const { Title, Text } = Typography;

interface FormRenderProps {
    schema: IFormRenderItem[];
    form: FormInstance;
}

const FormRender: React.FC<FormRenderProps> = ({ schema, form }) => {
    return (
        <Form form={form} layout="vertical" className="form-wrapper">
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
                            />
                        )}
                        {item.type === "checkbox" && <Checkbox disabled={item.disabled} />}
                        {item.type === "switch" && <Switch disabled={item.disabled} />}
                        {item.type === "select" && (
                            <Select
                                options={item.options}
                                disabled={item.disabled}
                                placeholder={item.placeholder}
                            />
                        )}
                        {item.type === "slider" && (
                            <Flex className="form-slider-wrapper">
                                <Slider
                                    disabled={item.disabled}
                                    range={item.range}
                                    marks={item.marks}
                                    className="form-slider"
                                />
                            </Flex>
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
                    </FormControlWrapper>
                );
            })}
        </Form>
    );
};

export default FormRender;
