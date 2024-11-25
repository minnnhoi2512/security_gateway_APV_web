export enum UserStatus {
    Active = "Active",
    Unactive = "Unactive",
}

export const statusUserMap: { [key in UserStatus]: { colorUserStatus: string; textUserStatus: string } } = {
    [UserStatus.Active]: { colorUserStatus: "green", textUserStatus: "Hợp lệ" },
    [UserStatus.Unactive]: { colorUserStatus: "red", textUserStatus: "Đã cấm" },
}


