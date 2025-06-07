import { Checkbox, Divider, Flex, Form, Input, Select, Slider, Switch, Typography } from "antd";
import type { IFormRenderItem } from "./interface";

import "./FormRender.css";

const { Title, Text } = Typography;

interface FormRenderProps {
    schema: IFormRenderItem[];
}

const FormRender: React.FC<FormRenderProps> = ({ schema }) => {
    return (
        <Form layout="vertical" className="form-wrapper">
            {schema.map((item) => {
                if (item.type === "title") {
                    return <Title level={item.level}>{item.initValue}</Title>;
                }

                if (item.type === "text") {
                    return <Text>{item.initValue}</Text>;
                }

                if (item.type === "divider") {
                    return <Divider />;
                }

                return (
                    <Form.Item
                        label={item.label}
                        name={item.name}
                        rules={item.validators}
                        initialValue={item.initValue}
                        className={`${item.hidden ? 'form-item-hidden' : ''}`}
                    >
                        {item.type === "input" && <Input type={item.subtype} />}
                        {item.type === "checkbox" && <Checkbox />}
                        {item.type === "switch" && <Switch />}
                        {item.type === "select" && <Select options={item.options} />}
                        {item.type === "slider" && (
                            <Flex className="form-slider-wrapper">
                                <Slider
                                    range={item.range}
                                    marks={item.marks}
                                    className="form-slider"
                                />
                            </Flex>
                        )}
                    </Form.Item>
                );
            })}
        </Form>
    );
};

export default FormRender;
