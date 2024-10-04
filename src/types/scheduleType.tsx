type Schedule = {
  scheduleId: number;
  scheduleName: string;
  daysOfProcess?: string;
  createTime: Date;
  updateTime: Date;
  description: string;
  status: boolean;
  duration?: number;
  scheduleTypeId?: number;
  createById? : number;
};

export default Schedule;
