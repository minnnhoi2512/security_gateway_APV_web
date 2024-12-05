export enum ScheduleType2 {
    Weekly = 1,
    Monthly = 2,
}

export const typeMap: { [key in ScheduleType2]: { colorScheduleType: string; textScheduleType: string } } = {
    [ScheduleType2.Weekly]: { colorScheduleType: "blue", textScheduleType: "Theo tuần" },
    [ScheduleType2.Monthly]: { colorScheduleType: "green", textScheduleType: "Theo tháng" },
};