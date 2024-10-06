import { createSlice } from "@reduxjs/toolkit";
import Visitor from "../../types/visitorType";


const initialState: Visitor = {
    visitorId : 0,
    visitorName : "",
    companyName : "",
    phoneNumber: "",
    visitorCredentialImage:"",
    createdDate : new Date(),
    updatedDate: new Date(),
    status : "",
    credentialsCard : "",
    credentialCardTypeId: 0,
};

const visitorSlice = createSlice({
  name: "visitor",
  initialState,
  reducers: {
  },
});

const visitorReducer = visitorSlice.reducer;
export default visitorReducer;
