import { Collapse, List, Typography, type CollapseProps } from "antd";

import "./Docs.css";
import { FilePdfOutlined } from "@ant-design/icons";

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

const Docs = () => {
    return (
        <>
            <Title level={3}>Документация</Title>
            <Text>Здесь можно найти документы и ответы на интересующие вопросы.</Text>
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

export default Docs;
