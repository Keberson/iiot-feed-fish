import React from "react";
import { Typography } from "antd";

import "./MenuItem.css";
import { Link } from "react-router";

interface MenuItemProps {
    text: string;
    url: string;
}

const { Text } = Typography;

const MenuItem: React.FC<MenuItemProps> = ({ text, url }) => {
    return (
        <Link to={url}>
            <Text className="menu-item-text">{text}</Text>
        </Link>
    );
};

export default MenuItem;
