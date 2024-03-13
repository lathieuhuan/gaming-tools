import { Weapon } from "@Src/models";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface UIState {
  loading: boolean;
  ready: boolean;
  b?: Weapon;
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
    updateB: (state, b: PayloadAction<Weapon>) => {
      state.b = b.payload.detach();
    },
  },
});

export const { updateUI, updateB } = uiSlice.actions;

export default uiSlice.reducer;
