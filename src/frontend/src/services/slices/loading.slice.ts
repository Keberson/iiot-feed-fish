import { createSlice } from "@reduxjs/toolkit";

interface LoadingState {
    requests: string[];
    isLoading: boolean;
}

const initialState: LoadingState = {
    requests: [],
    isLoading: false,
};

const loadingSlice = createSlice({
    name: "loading",
    initialState,
    reducers: {
        startLoading: (state, action) => {
            state.requests.push(action.payload);
            state.isLoading = true;
        },
        endLoading: (state, action) => {
            state.requests = state.requests.filter((id) => id !== action.payload);
            state.isLoading = state.requests.length > 0;
        },
        resetLoading: (state) => {
            state.requests = [];
            state.isLoading = false;
        },
    },
});

export const { startLoading, endLoading, resetLoading } = loadingSlice.actions;
export default loadingSlice;
