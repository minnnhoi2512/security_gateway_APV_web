import { createSlice } from "@reduxjs/toolkit";

import visitDetailListType from "../../types/VisitDetailListType";
import VisitDetail from "../../types/VisitDetailType";
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
  status : "",
};

const initVisitDetail: VisitDetail = {
  visitDetailId: 0,
  visitId: undefined,
  expectedEndHour: "",
  expectedStartHour: "",
  status: true,
  visitor: initVisitor,
};
const initialState: visitDetailListType = {
  visitQuantity: 0,
  scheduleId: 0,
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
