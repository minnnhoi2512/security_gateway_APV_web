
export enum ScheduleUserStatus {
    Assigned = "Assigned",
    Pending = "Pending",
    Approved = "Approved",
    Rejected = "Rejected",
    Cancelled = "Cancelled",
    Expired = "Expired",
}

export const scheduleStatusMap: { [key in ScheduleUserStatus]: { color: string; text: string } } = {
    [ScheduleUserStatus.Assigned]: { color: "green", text: "Chờ tạo" },
    [ScheduleUserStatus.Pending]: { color: "orange", text: "Chờ phê duyệt" },
    [ScheduleUserStatus.Approved]: { color: "blue", text: "Đã phê duyệt" },
    [ScheduleUserStatus.Rejected]: { color: "red", text: "Đã từ chối" },
    [ScheduleUserStatus.Cancelled]: { color: "gray", text: "Đã vô hiệu hóa" },
    [ScheduleUserStatus.Expired]: { color: "purple", text: "Đã hết hạn" },
};