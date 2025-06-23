import { useContext, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { Divider, Flex, Layout, Menu, Typography } from "antd";
import Sider from "antd/es/layout/Sider";

import Fish from "#assets/Fish/Fish";

import { useRTKEffects } from "#core/hooks/useRTKEffects/useRTKEffects";
import useAppSelector from "#core/hooks/useStore/useAppSelector";
import LoadingContext from "#core/contexts/LoadingContext";
import useAppDispatch from "#core/hooks/useStore/useAppDispatch";

import { useCheckTokenMutation } from "#services/auth";

import { setIsCorrectSession, setSession } from "#store/auth.slice";

import type { IBaseErrorResponse } from "#types/api.types";

import { items } from "./props";

import "./DashboardRootLayout.css";

const { Title } = Typography;

const DashboardRootLayout = () => {
    const PREFIX = "dashboard";

    const dispatch = useAppDispatch();
    const { pathname } = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [checkTokenApi, options] = useCheckTokenMutation();
    const session = useAppSelector((state) => state.auth.session);
    const { stopAll } = useContext(LoadingContext);

    useRTKEffects(options, "DASHBOARD_CHECK_TOKEN");

    useEffect(() => {
        dispatch(setIsCorrectSession(false));
    }, []);

    useEffect(() => {
        checkTokenApi({ token: session?.token || "" }).then((result) => {
            if (result.error && (result.error as IBaseErrorResponse).status === 401) {
                stopAll();
                dispatch(setSession(null));
            } else {
                setIsCorrectSession(true);
            }
        });
    }, [pathname]);

    return (
        <Layout className="sidabar-menu">
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <Flex className="sidebar-menu-title-wrapper">
                    <Fish />
                    <Title level={4} className={`sidebar-menu-title ${collapsed && "collapsed"}`}>
                        АСУ КР
                    </Title>
                </Flex>
                <Divider />
                <Menu
                    theme="dark"
                    selectedKeys={[pathname.replace(`/${PREFIX}/`, "").replace("/", "")]}
                    mode="inline"
                    items={items(PREFIX)}
                />
            </Sider>
            <Layout className="content-wrapper">
                <Flex vertical className="content">
                    <Outlet />
                </Flex>
            </Layout>
        </Layout>
    );
};

export default DashboardRootLayout;
