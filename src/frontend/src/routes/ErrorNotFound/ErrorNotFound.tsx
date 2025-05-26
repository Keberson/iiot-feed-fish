import { Flex, Typography } from "antd";

import "./ErrorNotFound.css";

const { Title, Link } = Typography;

const ErrorNotFound = () => {
    return (
        <Flex className="not-found-wrapper">
            <Title level={1}>404</Title>
            <Title level={3}>Страница не найдена</Title>
            <Link href="/dashboard/home">Перейти на главную страницу</Link>
        </Flex>
    );
};

export default ErrorNotFound;
