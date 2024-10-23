import { createSlice } from "@reduxjs/toolkit";
import Schedule from "../../types/scheduleType";

const initialState: Schedule = {
  scheduleId: 0,
  scheduleName: "",
  daysOfSchedule: "",
  createTime: new Date(),
  updateTime: new Date(),
  description: "",
  status: false,
  duration: 0,
  title: "",
  note: "",
  deadlineTime: new Date(),
  assignToId: 0,
  assignFromId: 0,
  createById: 0,
  createBy: {
    userId: 0,
    userName: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    image: "",
    createdDate: new Date(),
    updatedDate: new Date(),
    status: "Active",
  },
  assignTo: {
    userId: 0,
    userName: "",
  },
  assignFrom: {
    userId: 0,
    userName: "",
  },
  scheduleType: {
    scheduleTypeId: 0,
    scheduleTypeName: "",
    description: "",
    status: false,
  },
};

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {},
});

const scheduleReducer = scheduleSlice.reducer;

export default scheduleReducer;
