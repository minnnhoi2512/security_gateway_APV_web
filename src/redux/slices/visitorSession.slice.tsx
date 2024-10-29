import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import VisitorSessionType from "../../types/visitorSessionType";


const visitorSessionSlice = createSlice({
  name: "visitSession",
  initialState: {
    data : [] as VisitorSessionType[],
    isFiltering : false,
  },
  reducers: {
    setListOfVisitorSession(state, action : PayloadAction<VisitorSessionType[]>){
      state.data = action.payload
      state.isFiltering = true
    },
    cancelFilterVisitorSession(state){
      state.isFiltering = false
    }
  },
});

const visitorSessionReducer = visitorSessionSlice.reducer;
export const {setListOfVisitorSession, cancelFilterVisitorSession} = visitorSessionSlice.actions
export default visitorSessionReducer;
