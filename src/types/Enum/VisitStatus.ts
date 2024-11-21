export enum VisitStatus {
    Active = "Active",
    Pending = "Pending",
    Cancelled = "Cancelled",
    ActiveTemporary = "ActiveTemporary",
    Violation = "Violation",
    Inactive = "Inactive",
}

export const visitStatusMap: { [key in VisitStatus]: { colorVisitStatus: string; textVisitStatus: string } } = {
    [VisitStatus.Active]: { colorVisitStatus: "green", textVisitStatus: "Còn hiệu lực" },
    [VisitStatus.Pending]: { colorVisitStatus: "orange", textVisitStatus: "Chờ phê duyệt" },
    [VisitStatus.Cancelled]: { colorVisitStatus: "red", textVisitStatus: "Đã vô hiệu hóa" },
    [VisitStatus.ActiveTemporary]: { colorVisitStatus: "yellow", textVisitStatus: "Cần duyệt" },
    [VisitStatus.Violation]: { colorVisitStatus: "red", textVisitStatus: "Vi phạm" },
    [VisitStatus.Inactive]: { colorVisitStatus: "gray", textVisitStatus: "Đã hết hạn" },
};


