export enum UserRole {
  ADMIN = 1,
  MANAGER = 2,
  DEPARTMENTMANAGER = 3,
  STAFF = 4,
  SECURITY = 5,
}

export const roleMap: { [key in UserRole]: { textRole: string } } = {
  [UserRole.ADMIN]: { textRole: "Quản trị viên" },
  [UserRole.MANAGER]: { textRole: "Quản lý" },
  [UserRole.DEPARTMENTMANAGER]: { textRole: "Quản lý phòng ban" },
  [UserRole.STAFF]: { textRole: "Nhân viên phòng ban" },
  [UserRole.SECURITY]: { textRole: "Bảo vệ" },
};
