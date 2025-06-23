import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { ISession } from "#types/auth.types";

export interface AuthState {
    session: ISession | null;
    isCorrectSession: boolean;
}

const initialState: AuthState = {
    session: null,
    isCorrectSession: false,
};

const authSlice = createSlice({
    name: "authSlice",
    initialState,
    reducers: {
        setSession: (state, action: PayloadAction<ISession | null>) => {
            state.session = action.payload;
        },
        setIsCorrectSession: (state, action: PayloadAction<boolean>) => {
            state.isCorrectSession = action.payload;
        },
    },
});

export const { setSession, setIsCorrectSession } = authSlice.actions;

export default authSlice;
