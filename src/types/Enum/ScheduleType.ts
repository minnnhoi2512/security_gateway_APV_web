export enum ScheduleType {
    Daily = 1,
    Weekly = 2,
    Monthly = 3,
}

export const typeMap: { [key in ScheduleType]: { colorScheduleType: string; textScheduleType: string } } = {
    [ScheduleType.Daily]: { colorScheduleType: "default", textScheduleType: "Theo ngày" },
    [ScheduleType.Weekly]: { colorScheduleType: "blue", textScheduleType: "Theo tuần" },
    [ScheduleType.Monthly]: { colorScheduleType: "green", textScheduleType: "Theo tháng" },
};