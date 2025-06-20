import { Button, Card, Flex } from "antd";
import { LoginOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
import { useContext } from "react";

import { useLoginMutation } from "#services/auth";

import { setSession } from "#store/auth.slice";

import Fish from "#assets/Fish/Fish";

import MessageContext from "#core/contexts/MessageContext";
import useAppDispatch from "#core/hooks/useStore/useAppDispatch";
import { useRTKEffects } from "#core/hooks/useRTKEffects/useRTKEffects";
import LoadingContext from "#core/contexts/LoadingContext";

import FormRender from "#common/FormRender/FormRender";

import type { ILoginRequest } from "#types/auth.types";

import { schema } from "./props";

import "./Login.css";

const Login = () => {
    const LoginAction = "LOGIN";

    const dispatch = useAppDispatch();
    const { messageApi } = useContext(MessageContext);
    const { stop } = useContext(LoadingContext);
    const [apiLogin, loginOptions] = useLoginMutation();
    const [form] = useForm();

    useRTKEffects(loginOptions, LoginAction);

    const onClickForgetPassword = () => {
        messageApi?.open({
            type: "info",
            content: "Обратитесь к системному администратору",
        });
    };

    const apiLoginWrapper = (loginData: ILoginRequest) => {
        return apiLogin(loginData)
            .then((res) => {
                if (res.data) {
                    stop(LoginAction);
                    dispatch(setSession({ name: res.data.user.fullname, token: res.data?.token }));
                }
            })
            .catch();
    };

    const onClickLogin = () => {
        form.validateFields()
            .then((formValues) => apiLoginWrapper(formValues))
            .catch(() => {});
    };

    return (
        <Flex className="auth-wrapper">
            <Flex className="auth-card-wrapper">
                <Flex className="auth-card-title">
                    <Fish size="48px" fill="#000" />
                </Flex>
                <Card className="auth-card">
                    <FormRender schema={schema} form={form} />
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
