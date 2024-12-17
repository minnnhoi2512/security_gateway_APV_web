export enum ScheduleType2 {
    Weekly = 2,
    Monthly = 3,
}

export const typeMap: { [key in ScheduleType2]: { colorScheduleType: string; textScheduleType: string } } = {
    [ScheduleType2.Weekly]: { colorScheduleType: "#e67e22", textScheduleType: "Theo tuần" },
    [ScheduleType2.Monthly]: { colorScheduleType: "green", textScheduleType: "Theo tháng" },
};