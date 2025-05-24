import { Form, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import "./DynamicTableSearch.css";

const DynamicTableSearch = () => {
    return (
        <Form>
            <Form.Item className="dynamic-table-search-wrapper">
                <Input
                    placeholder="Поиск"
                    addonAfter={<SearchOutlined />}
                    className="dynamic-table-search"
                />
            </Form.Item>
        </Form>
    );
};

export default DynamicTableSearch;
