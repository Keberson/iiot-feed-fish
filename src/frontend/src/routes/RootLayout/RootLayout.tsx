import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import { Divider, Flex, Layout, Menu, Typography } from "antd";
import Sider from "antd/es/layout/Sider";

import Fish from "../../assets/Fish/Fish";
import { items } from "./props";

import "./RootLayout.css";

const { Title } = Typography;

const RootLayout = () => {
    const PREFIX = "dashboard";
    const { pathname } = useLocation();
    const [collapsed, setCollapsed] = useState(false);

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
                    defaultSelectedKeys={[pathname.replace(`/${PREFIX}/`, "")]}
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

export default RootLayout;
