import type React from "react";
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";

import ChartsBase from "../charts/ChartsBase/ChartsBase";

import type { ChartRenderBar } from "./interface";

interface ChartRenderBaseProps {
    data: unknown[];
    grid?: boolean;
    gridDash?: string;
    axisX?: boolean;
    axisXKey?: string;
    axisY?: boolean;
    tooltip?: boolean;
    legend?: boolean;
    bars: ChartRenderBar[];
}

const ChartRender: React.FC<ChartRenderBaseProps> = ({
    data,
    grid,
    gridDash,
    axisX,
    axisY,
    axisXKey,
    tooltip,
    legend,
    bars,
}) => {
    const ChartComponent = BarChart;

    return (
        <ChartsBase>
            <ChartComponent data={data}>
                {(grid || gridDash) && <CartesianGrid strokeDasharray={gridDash} />}
                {axisX && <XAxis dataKey={axisXKey} />}
                {axisY && <YAxis />}
                {tooltip && <Tooltip />}
                {legend && <Legend />}
                {bars.map((bar) => (
                    <Bar {...bar} />
                ))}
            </ChartComponent>
        </ChartsBase>
    );
};

export default ChartRender;
