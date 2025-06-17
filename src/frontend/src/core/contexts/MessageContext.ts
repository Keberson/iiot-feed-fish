import type { MessageInstance } from "antd/es/message/interface";
import { createContext } from "react";

export interface IMessageContext {
    messageApi: MessageInstance | null;
}

const defaultValues: IMessageContext = {
    messageApi: null,
};

const MessageContext = createContext<IMessageContext>(defaultValues);

export default MessageContext;
