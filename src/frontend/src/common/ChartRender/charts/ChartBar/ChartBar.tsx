import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";

import ChartsBase from "../ChartsBase/ChartsBase";

interface ChartBarProps {
    data: unknown[];
}

const ChartBar: React.FC<ChartBarProps> = ({ data }) => {
    return (
        <ChartsBase>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pv" fill="#8884d8" />
                <Bar dataKey="uv" fill="#82ca9d" />
            </BarChart>
        </ChartsBase>
    );
};

export default ChartBar;
