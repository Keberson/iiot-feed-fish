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
