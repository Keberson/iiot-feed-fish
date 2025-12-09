import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { prepareHeaders } from "#core/functions/prepareHeaders/prepareHeader";

export interface IAugerTestRequest {
    action: "start" | "stop";
    weight?: number;
}

export interface IAugerTestResponse {
    status: string;
    message: string;
}

export interface IScalesTestRequest {
    action: "tare" | "check";
    reference_weight?: number;
}

export interface IScalesTestResponse {
    status: string;
    message: string;
    current_weight?: number;
}

export interface ILimitSwitchTestRequest {
    position: string;
}

export interface ILimitSwitchTestResponse {
    status: string;
    message: string;
    triggered: boolean;
}

export interface IBarcodeTestRequest {
    barcode?: string;
}

export interface IBarcodeTestResponse {
    status: string;
    message: string;
    scanned: boolean;
    barcode?: string;
}

export interface IRFIDTestRequest {
    barcode?: string;  // Используем barcode для совместимости с бэкендом
}

export interface IRFIDTestResponse {
    status: string;
    message: string;
    scanned: boolean;
    barcode?: string;
}

export interface IObstacleSensorTestRequest {
    sensor_side: "front" | "back";
    obstacle_detected?: boolean;
}

export interface IObstacleSensorTestResponse {
    status: string;
    message: string;
    obstacle_detected: boolean;
    distance: number;
}

export const testingApi = createApi({
    reducerPath: "testingApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/testing`,
        prepareHeaders,
    }),
    endpoints: (builder) => ({
        testAuger: builder.mutation<IAugerTestResponse, IAugerTestRequest>({
            query: (body) => ({
                url: "/auger",
                method: "POST",
                body,
            }),
        }),
        testScales: builder.mutation<IScalesTestResponse, IScalesTestRequest>({
            query: (body) => ({
                url: "/scales",
                method: "POST",
                body,
            }),
        }),
        testLimitSwitches: builder.mutation<ILimitSwitchTestResponse, ILimitSwitchTestRequest>({
            query: (body) => ({
                url: "/limit-switches",
                method: "POST",
                body,
            }),
        }),
        testBarcodeScanner: builder.mutation<IBarcodeTestResponse, IBarcodeTestRequest>({
            query: (body) => ({
                url: "/barcode-scanner",
                method: "POST",
                body,
            }),
        }),
        testRFID: builder.mutation<IRFIDTestResponse, IRFIDTestRequest>({
            query: (body) => ({
                url: "/rfid",
                method: "POST",
                body,
            }),
        }),
        testObstacleSensors: builder.mutation<IObstacleSensorTestResponse, IObstacleSensorTestRequest>({
            query: (body) => ({
                url: "/obstacle-sensors",
                method: "POST",
                body,
            }),
        }),
    }),
});

export const {
    useTestAugerMutation,
    useTestScalesMutation,
    useTestLimitSwitchesMutation,
    useTestBarcodeScannerMutation,
    useTestRFIDMutation,
    useTestObstacleSensorsMutation,
} = testingApi;

