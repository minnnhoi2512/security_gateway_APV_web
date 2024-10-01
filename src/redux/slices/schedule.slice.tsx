import { createSlice } from "@reduxjs/toolkit";

import ScheduleType from "../../types/scheduleType";

const initialState: ScheduleType = {
  scheduleId: 0, // Default number for ID (you can choose a better default)
  scheduleName: "", // Empty string for name
  daysOfProcess: "",
  createTime: new Date(), // Current date as default
  updateTime: new Date(), // Current date as default
  description: "", // Empty string for description
  duration : 0,
  status: false, // Default false for status
  scheduleTypeId: 0, // Optional fields can be undefined
  createById: 0,
};

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {},
});

const scheduleReducer = scheduleSlice.reducer;

export default scheduleReducer;
