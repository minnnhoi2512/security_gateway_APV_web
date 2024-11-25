import { createSlice } from "@reduxjs/toolkit";
import QRCard from "../../types/QRCardType";

const initialState: QRCard = {} as QRCard;

const qrCardSlice = createSlice({
  name: "qrCard",
  initialState,
  reducers: {},
});

const qrCardReducer = qrCardSlice.reducer;
export default qrCardReducer;
