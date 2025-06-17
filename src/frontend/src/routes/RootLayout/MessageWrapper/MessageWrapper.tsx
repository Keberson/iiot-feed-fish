import { message } from "antd";
import type { ReactNode } from "react";

import MessageContext from "#core/contexts/MessageContext";

interface MessageWrapperProps {
    children: ReactNode;
}

const MessageWrapper: React.FC<MessageWrapperProps> = ({ children }) => {
    const [messageApi, contextHolder] = message.useMessage();

    return (
        <MessageContext.Provider value={{ messageApi }}>
            {contextHolder}
            {children}
        </MessageContext.Provider>
    );
};

export default MessageWrapper;
