import { createSlice } from "@reduxjs/toolkit";
import QRCardType from "../../types/QRCardType";

const initialState: QRCardType = {
    qrCardId: 0,
    cardVerification: "",
    createDate: new Date(),
    lastCancelDate: new Date(),
    cardImage: "",
    qrCardTypename: "",
    qrCardStatusName: "",
};

const qrCardSlice = createSlice({
  name: "qrCard",
  initialState,
  reducers: {
  },
});

const qrCardReducer = qrCardSlice.reducer;
export default qrCardReducer;
