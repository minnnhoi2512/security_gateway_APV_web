import { createSlice } from "@reduxjs/toolkit";
import filterTabType from "../../types/filterTabType";


const initialState: filterTabType= {
    isOpen: false
};

const filterTabSlice = createSlice({
  name: "filterTabs",
  initialState,
  reducers: {
    toggleStatusTab(state){
        if(state.isOpen === true){
            state.isOpen = false
        }
        else{
            state.isOpen = true
        }
    }
    },
});

const filterTabReducer = filterTabSlice.reducer;
export const {toggleStatusTab} = filterTabSlice.actions
export default filterTabReducer;