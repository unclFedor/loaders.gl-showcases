import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BaseMap } from "../../types";
import { BASE_MAPS } from "../../constants/map-styles";
import { RootState } from "../store";

// Define a type for the slice state
interface BaseMapsState {
  baseMap: BaseMap[];
  selectedBaseMap: string;
}
const initialState: BaseMapsState = {
  baseMap: BASE_MAPS,
  selectedBaseMap: BASE_MAPS[0].id,
};
const baseMapsSlice = createSlice({
  name: "baseMaps",
  initialState,
  reducers: {
    setInitialBaseMaps: () => {
      return initialState;
    },
    addBaseMap: (state: BaseMapsState, action: PayloadAction<BaseMap>) => {
      state.baseMap.push(action.payload);
      state.selectedBaseMap = action.payload.id;
    },
    setSelectedBaseMaps: (
      state: BaseMapsState,
      action: PayloadAction<string>
    ) => {
      const newMap = state.baseMap.find((map) => map.id === action.payload);
      if (newMap) {
        state.selectedBaseMap = action.payload;
      }
    },
    deleteBaseMaps: (state: BaseMapsState, action: PayloadAction<string>) => {
      state.baseMap = state.baseMap.filter(
        (keepMap) => keepMap.id !== action.payload
      );
      state.selectedBaseMap = state.baseMap[0].id;
    },
  },
});

export const selectBaseMaps = (state: RootState): BaseMap[] =>
  state.baseMaps.baseMap;
export const selectSelectedBaseMapId = (state: RootState): string =>
  state.baseMaps.selectedBaseMap;

export const { setInitialBaseMaps } = baseMapsSlice.actions;
export const { addBaseMap } = baseMapsSlice.actions;
export const { setSelectedBaseMaps } = baseMapsSlice.actions;
export const { deleteBaseMaps } = baseMapsSlice.actions;
export default baseMapsSlice.reducer;
