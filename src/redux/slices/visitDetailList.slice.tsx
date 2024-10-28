import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
const initialState: visitDetailListType[] = [{
  visitQuantity: 0,
  scheduleId: 0,
  visitType: "teststs",
  daysOfProcess: "",
  visitDetail: [initVisitDetail],
}];

const visitDetailListSlice = createSlice({
  name: "visitDetailList",
  initialState: {
    data : [] as visitDetailListType[],
    isFiltering : false,
  },
  reducers: {
    setListOfVisitList(state, action : PayloadAction<visitDetailListType[]>){
      state.data = action.payload
      state.isFiltering = true
    },
    cancelFilter(state){
      state.isFiltering = false
    }
  },
});

const visitDetailListReducer = visitDetailListSlice.reducer;
export const {setListOfVisitList, cancelFilter} = visitDetailListSlice.actions
export default visitDetailListReducer;
