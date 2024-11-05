export interface ScheduleUserType {
    id: number;
    title: string;
    description: string;
    note: string;
    assignTime: string;
    deadlineTime: string;
    status: string;
    assignFrom: {
      userId: number;
      userName: string;
    };
    assignTo: {
      userId: number;
      userName: string;
    };
    schedule: {
      scheduleId: number;
      scheduleName: string;
      daysOfSchedule: string;
      scheduleType: {
        scheduleTypeId: number;
        scheduleTypeName: string;
      };
    };
  }