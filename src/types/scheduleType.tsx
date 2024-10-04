type Schedule = {
  scheduleId: number;
  scheduleName: string;
  daysOfProcess?: string;
  createTime: Date;
  updateTime: Date;
  description: string;
  status: boolean;
  duration?: number;
  scheduleType?: {
    description?: string;
    scheduleTypeId?: number;
    scheduleTypeName?: string;
    status?: boolean;
  };
  createById?: number;
};

export default Schedule;
