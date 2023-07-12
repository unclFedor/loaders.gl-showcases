import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { DebugOptions } from "../../types";
import { RootState } from "../store";

// Define a type for the slice state
interface miniMapState {
  value: boolean;
}
const initialState: miniMapState = {
  value: true,
};
const miniMapSlice = createSlice({
  name: "miniMap",
  initialState,
  reducers: {
    setMiniMap: (state: miniMapState, action: PayloadAction<boolean>) => {
      state.value = action.payload;
    },
  },
});
export const selectMiniMap = (state: RootState): boolean => state.miniMap.value;
export const { setMiniMap } = miniMapSlice.actions;
export default miniMapSlice.reducer;
