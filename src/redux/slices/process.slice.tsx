import { createSlice } from "@reduxjs/toolkit";

import ProcessType from "../../types/processType";

const initialState: ProcessType = {
  processId: 0, // Default number for ID (you can choose a better default)
  processName: "", // Empty string for name
  createTime: new Date(), // Current date as default
  description: "", // Empty string for description
  status: false, // Default false for status
  visitTypeId: undefined, // Optional fields can be undefined
  visitType: undefined,
  createBy: undefined,
};

const processSlice = createSlice({
  name: "process",
  initialState,
  reducers: {},
});

const processReducer = processSlice.reducer;

export default processReducer;
