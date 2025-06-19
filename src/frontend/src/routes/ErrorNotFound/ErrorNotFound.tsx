import { Flex, Typography } from "antd";

import useAppSelector from "#core/hooks/useStore/useAppSelector";

import "./ErrorNotFound.css";

const { Title, Link } = Typography;

const ErrorNotFound = () => {
    const session = useAppSelector((state) => state.auth.session);
    const url = session ? "/dashboard/home" : "/auth/login";

    return (
        <Flex className="not-found-wrapper">
            <Title level={1}>404</Title>
            <Title level={3}>Страница не найдена</Title>
            <Link href={url}>Перейти на главную страницу</Link>
        </Flex>
    );
};

export default ErrorNotFound;
