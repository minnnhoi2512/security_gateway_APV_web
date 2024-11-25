import { createSlice } from "@reduxjs/toolkit";

import visitListType from "../../types/visitListType";

const initialState: visitListType = {} as visitListType;

const visitListSlice = createSlice({
  name: "visitList",
  initialState,
  reducers: {},
});

const visitListReducer = visitListSlice.reducer;

export default visitListReducer;
