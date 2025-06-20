import type { IBaseItemResponse, IPaginationResponse } from "./api.types";

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

interface IFeedingCreateEditBase {
    weight: number;
    pool_id: string;
    feed_id: string;
}

interface IFeedingCreateEditPeriod extends IFeedingCreateEditBase {
    period_id: string;
}

interface IFeedingCreateEditOtherPeriod extends IFeedingCreateEditBase {
    other_period: string;
}

export type IFeedingCreateEditRequest = IFeedingCreateEditPeriod | IFeedingCreateEditOtherPeriod;

export interface IFeedingList extends IPaginationResponse {
    data: IFeedingItem[];
}

export interface IFeedingFilter {
    pool?: string;
    feed?: string;
    minWeight?: number;
    maxWeight?: number;
}
