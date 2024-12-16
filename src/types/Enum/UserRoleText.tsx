export enum UserRoleText {
  ADMIN = "Admin",
  MANAGER = "Manager",
  DEPARTMENTMANAGER = "DepartmentManager",
  STAFF = "Staff",
  SECURITY = "Security",
}

export const roleTextMap: { [key in UserRoleText]: { textRole: string } } = {
  [UserRoleText.ADMIN]: { textRole: "Quản trị viên" },
  [UserRoleText.MANAGER]: { textRole: "Quản lý" },
  [UserRoleText.DEPARTMENTMANAGER]: { textRole: "Quản lý phòng ban" },
  [UserRoleText.STAFF]: { textRole: "Nhân viên phòng ban" },
  [UserRoleText.SECURITY]: { textRole: "Bảo vệ" },
};
