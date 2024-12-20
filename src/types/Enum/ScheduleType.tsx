export enum ScheduleType {
    Daily = 1,
    Weekly = 2,
    Monthly = 3,
}

export const typeMap: { [key in ScheduleType]: { colorScheduleType: string; textScheduleType: string } } = {
    [ScheduleType.Daily]: { colorScheduleType: "default", textScheduleType: "Theo ngày" },
    [ScheduleType.Weekly]: { colorScheduleType: "#e67e22", textScheduleType: "Theo tuần" },
    [ScheduleType.Monthly]: { colorScheduleType: "#2980b9", textScheduleType: "Theo tháng" },
};