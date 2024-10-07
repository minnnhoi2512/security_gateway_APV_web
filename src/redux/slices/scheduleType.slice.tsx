import { createSlice } from "@reduxjs/toolkit";

type scheduleType = {
  description?: string;
  scheduleTypeId?: number;
  scheduleTypeName?: string;
  status?: boolean;
};

const initialState: scheduleType = {
  scheduleTypeId: 0, // Default number for ID (you can choose a better default)
  description: "", // Empty string for name
  scheduleTypeName: "",
  status: false, // Default false for status
};

const scheduleTypeSlice = createSlice({
  name: "scheduleType",
  initialState,
  reducers: {},
});

const scheduleTypeReducer = scheduleTypeSlice.reducer;

export default scheduleTypeReducer;
