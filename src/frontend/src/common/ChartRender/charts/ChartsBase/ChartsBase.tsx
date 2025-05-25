import type { ReactElement } from "react";
import type React from "react";
import { ResponsiveContainer } from "recharts";

interface ChartsBaseProps {
    children: ReactElement;
}

const ChartsBase: React.FC<ChartsBaseProps> = ({ children }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            {children}
        </ResponsiveContainer>
    );
};

export default ChartsBase;
