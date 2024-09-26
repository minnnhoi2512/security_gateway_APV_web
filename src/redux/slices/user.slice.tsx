import { createSlice } from "@reduxjs/toolkit";

import UserType from "../../types/userType";

const initialState: UserType = {
  UserId: 0,
  Username: "",
  Password: "",
  FullName: "",
  Email: "",
  PhoneNumber: "",
  CreateDate: new Date(),
  UpdateDate: new Date(),
  Status: "",
  RoleId: 0,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
});

const userReducer = userSlice.reducer;

export default userReducer;
