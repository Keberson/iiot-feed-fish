import { Typography } from "antd";

import "./LogDescription.css";

const { Paragraph } = Typography;

interface LogDescriptionProps {
    value: string;
}

const LogDescription: React.FC<LogDescriptionProps> = ({ value }) => {
    return (
        <Paragraph
            ellipsis={{
                rows: 1,
                expandable: "collapsible",
                symbol: (value) => {
                    return (
                        <>
                            {value && "Свернуть"}
                            {!value && "Развернуть"}
                        </>
                    );
                },
            }}
            className="log-description-item"
        >
            {value}
        </Paragraph>
    );
};

export default LogDescription;
