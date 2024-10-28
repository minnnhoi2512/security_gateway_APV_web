import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import NotificationType from "../../types/notificationType";




const notificationSlice = createSlice({
  name: "notiList",
  initialState : {
    notification : JSON.parse(localStorage.getItem("notification") as string) as NotificationType[],
    isnew : false
  },
  reducers: {
    pushNotification(state, action : PayloadAction<NotificationType>){
        state.notification?.push(action.payload)
        state.isnew = true
    },
    reloadNoti(state){
        state.isnew = false
    },
    markAsRead(state, action : PayloadAction<string>){
        var noti = state.notification
        if(noti){
            var readNoti = noti.find(s => s.id == action.payload)
            if(readNoti){
                readNoti.isRead = true
            }
        }
        localStorage.setItem("notification", JSON.stringify(noti))
    }
    },
});

const notificationReducer = notificationSlice.reducer;
export const {pushNotification,markAsRead, reloadNoti} = notificationSlice.actions
export default notificationReducer;