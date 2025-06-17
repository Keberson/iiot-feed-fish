import React, { useState, useEffect, useMemo } from 'react';
import { Button, Slider, Spin } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import './RouteVisualizer.css';

interface RouteTask {
    pool: string;
    arrival_time: string;
    actual_start_time: string;
    finish_time: string;
}

// Fixed positions for the pools from the generator script
const poolPositions: { [key: string]: number } = {
    'home': 0,
    'Бассейн 1': 10,
    'Бассейн 2': 25,
    'Бассейн 3': 45,
    'Бассейн 4': 60,
};
const MAX_DISTANCE = Math.max(...Object.values(poolPositions));

const RouteVisualizer: React.FC = () => {
    const [routeData, setRouteData] = useState<RouteTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [simulationTime, setSimulationTime] = useState<Date>(new Date());
    const [timeSpeed, setTimeSpeed] = useState(300); // Higher is faster

    const simulationStartTime = useMemo(() => {
        if (routeData.length === 0) return new Date();
        const firstArrivalTime = new Date(routeData[0].arrival_time);
        firstArrivalTime.setHours(firstArrivalTime.getHours() - 1); // Start 1 hour before first task
        return firstArrivalTime;
    }, [routeData]);

    useEffect(() => {
        fetch('/feeding_route_linear.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data: RouteTask[]) => {
                setRouteData(data);
                // Set initial simulation time based on the first task's arrival
                if (data.length > 0) {
                    const firstArrivalTime = new Date(data[0].arrival_time);
                    firstArrivalTime.setHours(firstArrivalTime.getHours() - 1);
                    setSimulationTime(firstArrivalTime);
                }
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!isPlaying || routeData.length === 0) return;

        const timer = setInterval(() => {
            setSimulationTime((prevTime: Date) => new Date(prevTime.getTime() + timeSpeed * 100));
        }, 100);

        return () => clearInterval(timer);
    }, [isPlaying, timeSpeed, routeData]);
    
    const { cartPosition, cartStatus, nextTask } = useMemo(() => {
        if (routeData.length === 0) {
            return { cartPosition: 0, cartStatus: 'Ожидание', nextTask: null };
        }
    
        let currentTaskIndex = -1;
        for (let i = 0; i < routeData.length; i++) {
            const taskStartTime = new Date(routeData[i].actual_start_time);
            if (simulationTime >= taskStartTime) {
                currentTaskIndex = i;
            } else {
                break;
            }
        }
    
        if (currentTaskIndex === -1) {
            // Before the first task
            const next = routeData[0];
            const arrival = new Date(next.arrival_time);
            const timeToArrival = arrival.getTime() - simulationTime.getTime();
    
            if (timeToArrival > 0) {
                const startPos = poolPositions['home'];
                const endPos = poolPositions[next.pool];
                const totalTravelTime = arrival.getTime() - simulationStartTime.getTime();
                const elapsedTime = simulationTime.getTime() - simulationStartTime.getTime();
                const travelProgress = totalTravelTime > 0 ? Math.min(elapsedTime / totalTravelTime, 1) : 0;
                
                const pos = startPos + (endPos - startPos) * travelProgress;
                return { cartPosition: pos, cartStatus: `Едет к ${next.pool}`, nextTask: next };
            }
        }
        
        const currentTask = routeData[currentTaskIndex] ?? routeData[0];
        const next = routeData[currentTaskIndex + 1];
        const inTaskTime = new Date(currentTask.actual_start_time);
        const outTaskTime = new Date(currentTask.finish_time);
    
        if (simulationTime >= inTaskTime && simulationTime <= outTaskTime) {
            return {
                cartPosition: poolPositions[currentTask.pool],
                cartStatus: `Кормление: ${currentTask.pool}`,
                nextTask: next,
            };
        }
    
        if (next) {
            const arrivalTime = new Date(next.arrival_time);
            if (simulationTime < arrivalTime) {
                const startPos = poolPositions[currentTask.pool];
                const endPos = poolPositions[next.pool];
                const travelTime = arrivalTime.getTime() - outTaskTime.getTime();
                const elapsedTime = simulationTime.getTime() - outTaskTime.getTime();
                const progress = travelTime > 0 ? Math.min(elapsedTime / travelTime, 1) : 0;
                const pos = startPos + (endPos - startPos) * progress;
                return { cartPosition: pos, cartStatus: `Едет к ${next.pool}`, nextTask: next };
            }
        }
    
        // After the last task is finished
        const lastTaskFinishTime = new Date(routeData[routeData.length - 1].finish_time);
        if (simulationTime > lastTaskFinishTime) {
            return {
                cartPosition: poolPositions[routeData[routeData.length - 1].pool],
                cartStatus: 'Все задачи выполнены',
                nextTask: null,
            };
        }

        // Default/fallback state
        return {
             cartPosition: poolPositions['home'], 
             cartStatus: 'Ожидание...', 
             nextTask: routeData[0] 
        };

    }, [simulationTime, routeData, simulationStartTime]);

    if (loading) return <Spin tip="Загрузка данных о маршруте..." />;
    if (error) return <div>Ошибка: {error}</div>;

    const cartLeftPercent = (cartPosition / MAX_DISTANCE) * 100;

    return (
        <div className="route-visualizer">
            <h3>Динамическая визуализация маршрута</h3>
            <div className="timeline-controls">
                <Button
                    icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                    onClick={() => setIsPlaying(!isPlaying)}
                >
                    {isPlaying ? 'Пауза' : 'Старт'}
                </Button>
                <div style={{ width: 200 }}>
                    <Slider
                        min={60}
                        max={1000}
                        value={timeSpeed}
                        onChange={(value: number) => setTimeSpeed(value)}
                        tipFormatter={(value?: number) => `${value}x`}
                    />
                </div>
                <div className="timeline-info">
                    <div className="info-item">
                        <strong>Время симуляции:</strong>
                        <span>{simulationTime.toLocaleTimeString()}</span>
                    </div>
                    <div className="info-item">
                        <strong>Статус тележки:</strong>
                        <span>{cartStatus}</span>
                    </div>
                </div>
            </div>

            <div className="visualization-area">
                <div className="rail"></div>
                {Object.entries(poolPositions).map(([name, pos]) => (
                    <div
                        key={name}
                        className={name === 'home' ? 'home-marker' : 'pool-marker'}
                        style={{ left: `${(pos / MAX_DISTANCE) * 100}%` }}
                    >
                        <div className="marker-dot"></div>
                        <div className="marker-label">{name}</div>
                    </div>
                ))}
                <div className="cart" style={{ left: `${cartLeftPercent}%` }}></div>
            </div>

            {nextTask && (
                <div className="task-info">
                    <h4>Следующая задача</h4>
                    <p><strong>Бассейн:</strong> {nextTask.pool}</p>
                    <p><strong>Плановое прибытие:</strong> {new Date(nextTask.arrival_time).toLocaleTimeString()}</p>
                </div>
            )}
        </div>
    );
};

export default RouteVisualizer; 