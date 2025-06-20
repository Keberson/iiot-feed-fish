export interface IBaseResponse {
    status: string;
    message: string;
}

export interface IBaseItemResponse {
    id: string;
    name: string;
}

export interface IBaseErrorResponse {
    data: {
        message: string;
        status: "error";
    };
    status: number;
}

export interface IPaginationResponse {
    current: number;
    itemsPerPage: number;
    total: number;
    totalPages: number;
}

export interface IPaginationRequest {
    current: number;
    itemsPerPage: number;
}

export type IOptionalPaginationRequest = IPaginationRequest | undefined;
