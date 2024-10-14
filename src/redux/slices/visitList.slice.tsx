import { createSlice } from "@reduxjs/toolkit";

import visitListType from "../../types/visitListType";

const initialState: visitListType = {
    visitId: 0,
    visitName: "",
    visitQuantity: 0,
    description: "",
    visitType: "",
    createdBy: undefined, // Optional, can be undefined
    updatedBy: undefined, // Optional, can be undefined
};

const visitListSlice = createSlice({
  name: "visitList",
  initialState,
  reducers: {},
});

const visitListReducer = visitListSlice.reducer;

export default visitListReducer;