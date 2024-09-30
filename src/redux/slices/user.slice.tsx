import { createSlice } from "@reduxjs/toolkit";

import UserType from "../../types/userType";

const initialState: UserType = {
  userId: 0,
  username: "",
  password: "",
  fullName: "",
  email: "",
  phoneNumber: "",
  image : "",
  createDate: new Date(),
  updateDate: new Date(),
  status: "",
  roleId: 0,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
});

const userReducer = userSlice.reducer;

export default userReducer;
