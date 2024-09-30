import { createSlice } from "@reduxjs/toolkit";

import QRCardType from "../../types/QRCardType";

const initialState: QRCardType = {
  qrCardId: 0, // Default number for ID
  cardVerification: "", // Empty string for verification
  createDate: undefined, // Optional field, can be undefined
  lastCancelDate: undefined, // Optional field, can be undefined
  cardImage: undefined, // Optional field, can be undefined
  qrCardTypename: undefined, // Optional field, can be undefined
  qrCardStatusName: undefined, // Optional field, can be undefined
};

const qrCardSlice = createSlice({
  name: "qrCard",
  initialState,
  reducers: {},
});

const qrCardReducer = qrCardSlice.reducer;

export default qrCardReducer;
