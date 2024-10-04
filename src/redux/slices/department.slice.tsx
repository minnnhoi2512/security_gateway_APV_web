// slices/departmentSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import DepartmentType from "../../types/departmentType";

const initialState: DepartmentType = {
    departmentId: 0,
    departmentName: "",
    description: "",
    createDate: new Date(),
    updatedDate: new Date(),
    acceptLevel: 0,
};

const departmentSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {
    },
});

 const departmentReducer = departmentSlice.reducer;
export default departmentReducer;
