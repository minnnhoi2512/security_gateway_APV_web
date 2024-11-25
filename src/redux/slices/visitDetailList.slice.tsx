import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import VisitDetail from "../../types/visitDetailType";
import Visitor from "../../types/visitorType";
import VisitDetailList from "../../types/visitDetailListType";

const initVisitor: Visitor = {} as Visitor;

const initVisitDetail: VisitDetail = {
  visitDetailId: 0,
  visitId: undefined,
  expectedEndHour: "",
  expectedStartHour: "",
  status: true,
  visitor: initVisitor,
};
const initialState: VisitDetailList[] = [
  {
    visitQuantity: 0,
    scheduleId: 0,
    visitType: "teststs",
    daysOfProcess: "",
    visitDetail: [initVisitDetail],
  },
];

const visitDetailListSlice = createSlice({
  name: "visitDetailList",
  initialState: {
    data: [] as VisitDetailList[],
    isFiltering: false,
  },
  reducers: {
    setListOfVisitList(state, action: PayloadAction<VisitDetailList[]>) {
      state.data = action.payload;
      state.isFiltering = true;
    },
    cancelFilter(state) {
      state.isFiltering = false;
    },
  },
});

const visitDetailListReducer = visitDetailListSlice.reducer;
export const { setListOfVisitList, cancelFilter } =
  visitDetailListSlice.actions;
export default visitDetailListReducer;
