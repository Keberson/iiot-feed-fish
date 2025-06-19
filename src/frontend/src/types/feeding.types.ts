import type { IBaseItemResponse } from "./api.types";

export interface IFeedingTableItem {
    id: string;
    pool: string;
    feed: string;
    weight: number;
    period: string;
}

export interface IFeedingFormDataResponse {
    pool: IBaseItemResponse[];
    feed: IBaseItemResponse[];
    period: IBaseItemResponse[];
    weight: {
        min: number;
        max: number;
    };
}

interface IFeedingItemBase {
    uuid: string;
    pool: IBaseItemResponse;
    feed: IBaseItemResponse;
    weight: number;
}

interface IFeedingItemPeriod extends IFeedingItemBase {
    period: IBaseItemResponse;
}

interface IFeedingItemOtherPeriod extends IFeedingItemBase {
    period: "other";
    other_period: string;
}

export type IFeedingItem = IFeedingItemPeriod | IFeedingItemOtherPeriod;

export interface IFeedingCreateEditRequest {
    weight: number;
    pool_id: string;
    feed_id: string;
    period_id: string;
    other_period?: string;
}
