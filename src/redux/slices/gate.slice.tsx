import { createSlice } from "@reduxjs/toolkit";
import Gate from "../../types/gateType";

const initialState: Gate = {} as Gate;

const gateSlice = createSlice({
  name: "gate",
  initialState,
  reducers: {},
});

const gateReducer = gateSlice.reducer;
export default gateReducer;
