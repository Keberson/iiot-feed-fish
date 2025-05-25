import { Collapse, List, Typography, type CollapseProps } from "antd";
import { FilePdfOutlined } from "@ant-design/icons";

import "./Help.css";

const { Title, Text, Link } = Typography;

const docs = [
    {
        title: "Руководство пользователя",
        url: "http://smth.ru",
    },
];

const faq: CollapseProps["items"] = [
    {
        label: "Вопрос №1",
        children: "Ответ №1",
    },
];

const Help = () => {
    return (
        <>
            <Title level={3}>Помощь и документация</Title>
            <Text>Здесь можно найти документацию и ответы на часто задаваемые вопросы.</Text>
            <Title level={5}>Файлы</Title>
            <List
                itemLayout="horizontal"
                dataSource={docs}
                renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<FilePdfOutlined />}
                            title={<Link href={item.url}>{item.title}</Link>}
                        />
                    </List.Item>
                )}
            />
            <Title level={5}>FAQ</Title>
            <Collapse items={faq} />
        </>
    );
};

export default Help;
