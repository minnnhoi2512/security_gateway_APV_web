export enum TaskStatus {
    Approved = "Approved",
    Pending = "Pending",
    Expired = "Expired",
    ActiveTemporary = "ActiveTemporary",
    Violation = "Violation",
    Rejected = "Rejected",
    Cancel = "Cancel",
}

export const taskStatusMap: { [key in TaskStatus]: { colorVisitStatus: string; textVisitStatus: string } } = {
    [TaskStatus.Approved]: { colorVisitStatus: "green", textVisitStatus: "Đã phê duyệt" },
    [TaskStatus.Pending]: { colorVisitStatus: "orange", textVisitStatus: "Chờ phê duyệt" },
    [TaskStatus.Expired]: { colorVisitStatus: "red", textVisitStatus: "Đã hết hạn" },
    [TaskStatus.ActiveTemporary]: { colorVisitStatus: "yellow", textVisitStatus: "Cần duyệt" },
    [TaskStatus.Violation]: { colorVisitStatus: "red", textVisitStatus: "Vi phạm" },
    [TaskStatus.Rejected]: { colorVisitStatus: "gray", textVisitStatus: "Đã từ chối" },
    [TaskStatus.Cancel]: { colorVisitStatus: "gray", textVisitStatus: "Đã hủy" },
};


