import { createSlice } from "@reduxjs/toolkit";
import ScheduleStaff from "../../types/scheduleStaffType";

const initialState: ScheduleStaff = {} as ScheduleStaff;
const scheduleStaffSlice = createSlice({
  name: "scheduleStaffSlice",
  initialState,
  reducers: {
  },
});

const scheduleStaffReducer = scheduleStaffSlice.reducer;
export default scheduleStaffReducer;