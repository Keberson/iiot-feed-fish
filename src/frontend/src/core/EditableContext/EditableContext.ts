import { createContext } from "react";
import type { FormInstance } from "antd";

const EditableContext = createContext<FormInstance<object> | null>(null);

export default EditableContext;
