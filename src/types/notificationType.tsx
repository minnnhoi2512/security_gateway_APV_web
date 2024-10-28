type NotificationType = {
    id : string,
    title : string,
    discription: string,
    notiType: string,
    scheduleAssign? : ScheduleAssignType 
    isRead : boolean
}
type ScheduleAssignType = {
    scheduleId : number
}
export default NotificationType;