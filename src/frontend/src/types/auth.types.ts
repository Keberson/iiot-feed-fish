import type { IBaseResponse } from "./api.types";

export interface ISession {
    name: string;
    token: string;
}

export interface IAuthUser {
    uuid: string;
    login: string;
    fullname: string;
}

export interface ILoginRequest {
    login: string;
    password: string;
}

export interface ILoginResponse extends IBaseResponse {
    token: string;
    user: IAuthUser;
}

export interface ICheckTokenRequest {
    token: string;
}

export interface ICheckTokenResponse extends IBaseResponse {
    user: IAuthUser;
}
