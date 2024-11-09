export enum VisitStatus {
    Assigned = "Assigned",
    Pending = "Pending",
    Approved = "Approved",
    Rejected = "Rejected",
    Cancelled = "Cancelled",
}

export const statusMap: { [key in VisitStatus]: { color: string; text: string } } = {
    [VisitStatus.Assigned]: { color: "green", text: "Chờ tạo" },
    [VisitStatus.Pending]: { color: "orange", text: "Chờ phê duyệt" },
    [VisitStatus.Approved]: { color: "blue", text: "Đã phê duyệt" },
    [VisitStatus.Rejected]: { color: "red", text: "Đã từ chối" },
    [VisitStatus.Cancelled]: { color: "gray", text: "Đã hủy" },
};