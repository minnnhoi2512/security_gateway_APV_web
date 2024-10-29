type NotificationType = {
    notificationUserID : string,
    notification : NotificationResType,
    notiType: string,
    scheduleAssign? : ScheduleAssignType 
    readStatus : boolean,
    senderID: number,
    receiverID: number
}
type ScheduleAssignType = {
    scheduleId : number
}
type NotificationResType = {
    notificationID: number,
    title: string,
    content: string,
    sentDate: Date,
    readDate: Date,
    status: boolean
}
export default NotificationType;