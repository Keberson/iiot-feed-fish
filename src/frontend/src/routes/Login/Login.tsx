import { Button, Card, Flex, Form, Input, Typography } from "antd";
import {
    LockOutlined,
    LoginOutlined,
    QuestionCircleOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { useContext } from "react";

import Fish from "#assets/Fish/Fish";

import MessageContext from "#core/contexts/MessageContext";
import SessionContext from "#core/contexts/SessionContext";

import "./Login.css";

const { Text } = Typography;

const Login = () => {
    const { messageApi } = useContext(MessageContext);
    const { login } = useContext(SessionContext);

    const onClickForgetPassword = () => {
        messageApi?.open({
            type: "info",
            content: "Обратитесь к системному администратору",
        });
    };

    const onClickLogin = () => {
        login({ name: "", token: "" });
    };

    return (
        <Flex className="auth-wrapper">
            <Flex className="auth-card-wrapper">
                <Flex className="auth-card-title">
                    <Fish size="48px" fill="#000" />
                </Flex>
                <Card className="auth-card">
                    <Form layout="vertical">
                        <Form.Item label={<Text>Имя пользователя</Text>}>
                            <Input
                                addonBefore={<UserOutlined />}
                                placeholder="Введите имя пользователя"
                            />
                        </Form.Item>
                        <Form.Item label={<Text>Пароль</Text>}>
                            <Input
                                addonBefore={<LockOutlined />}
                                type="password"
                                placeholder="Введите пароль"
                            />
                        </Form.Item>
                    </Form>
                    <Flex className="auth-card-buttons">
                        <Button onClick={onClickForgetPassword}>
                            Забыл пароль <QuestionCircleOutlined />
                        </Button>
                        <Button type="primary" onClick={onClickLogin}>
                            Войти <LoginOutlined />
                        </Button>
                    </Flex>
                </Card>
            </Flex>
        </Flex>
    );
};

export default Login;
