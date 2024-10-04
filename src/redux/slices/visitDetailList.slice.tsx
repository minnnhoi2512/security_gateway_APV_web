import { createSlice } from "@reduxjs/toolkit";

import visitDetailListType from "../../types/visitDetailListType";
import VisitDetail from "../../types/visitDetailType";
import Visitor from "../../types/visitorType";

const initVisitor: Visitor = {
  visitorId: 0,
  visitorName: "",
  companyName: "",
  phoneNumber: "",
  createdDate: new Date(),
  updatedDate: new Date(),
  credentialsCard: "",
  credentialCardTypeId: 0,
};

const initVisitDetail: VisitDetail = {
  visitDetailId: 0,
  visitId: undefined,
  expectedStartDate: new Date(),
  expectedEndDate: new Date(),
  expectedStartTime: "",
  expectedEndTime: "",
  status: true,
  visitor: initVisitor,
};
const initialState: visitDetailListType = {
  dateRegister: new Date(),
  visitQuantity: 0,
  visitType: "",
  daysOfProcess: "",
  visitDetail: [initVisitDetail],
};

const visitDetailListSlice = createSlice({
  name: "visitDetailList",
  initialState,
  reducers: {},
});

const visitDetailListReducer = visitDetailListSlice.reducer;

export default visitDetailListReducer;
