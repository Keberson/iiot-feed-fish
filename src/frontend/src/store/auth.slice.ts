import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { ISession } from "#types/auth.types";

export interface AuthState {
    session: ISession | null;
}

const initialState: AuthState = {
    session: null,
};

const authSlice = createSlice({
    name: "authSlice",
    initialState,
    reducers: {
        setSession: (state, action: PayloadAction<ISession | null>) => {
            state.session = action.payload;
            console.log(state.session);
        },
    },
});

export const { setSession } = authSlice.actions;

export default authSlice;
