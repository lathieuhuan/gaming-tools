import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface UIState {
  loading: boolean;
  ready: boolean;
}

const initialState: UIState = {
  loading: false,
  ready: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    updateUI: (state, action: PayloadAction<Partial<UIState>>) => {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
});

export const { updateUI } = uiSlice.actions;

export default uiSlice.reducer;
