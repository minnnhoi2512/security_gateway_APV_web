import { createSlice } from "@reduxjs/toolkit";

import ScheduleType from "../../types/ScheduleType";

const initialState: ScheduleType = {
  scheduleId: 0, // Default number for ID (you can choose a better default)
  scheduleName: "", // Empty string for name
  daysOfSchedule: "",
  createTime: new Date(), // Current date as default
  updateTime: new Date(), // Current date as default
  description: "", // Empty string for description
  duration : 0,
  status: false, // Default false for status
  createById: 0,
  createBy : {
    userId : 0,
  }
};

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {},
});

const scheduleReducer = scheduleSlice.reducer;

export default scheduleReducer;
