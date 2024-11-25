export enum CardStatusType {
    None = "None",
    Active = "Active",
    Inactive = "Inactive",
    Lost = "Lost",
}

export const typeCardStatusMap: { [key in CardStatusType]: { colorCardStatusType: string; textCardStatusType: string } } = {
    [CardStatusType.None]: { colorCardStatusType: "blue", textCardStatusType: "Không xác định" },
    [CardStatusType.Active]: { colorCardStatusType: "green", textCardStatusType: "Còn sử dụng" },
    [CardStatusType.Inactive]: { colorCardStatusType: "red", textCardStatusType: "Đã vô hiệu hóa" },
    [CardStatusType.Lost]: { colorCardStatusType: "black", textCardStatusType: "Mất thẻ" },
};