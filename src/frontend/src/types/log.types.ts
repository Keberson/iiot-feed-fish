import type { IPaginationResponse } from "./api.types";

export type ILogType = "cart" | "bunker" | "system";

export interface ILogTableItem {
    id: string;
    action: string;
    when: string;
    description: string;
    type: ILogType;
}

export interface ILogItem {
    uuid: string;
    action: string;
    when: string;
    description: string;
    type: ILogType;
}

export interface ILogList extends IPaginationResponse {
    data: ILogItem[];
}

export interface ILogTable extends IPaginationResponse {
    data: ILogTableItem[];
}

export interface ILogFilter {
    type?: ILogType;
    dates?: [string, string];
}
