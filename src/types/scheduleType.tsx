type Schedule = {
  scheduleId?: number;
  scheduleName: string;
  daysOfSchedule?: string;
  createTime: Date;
  updateTime: Date;
  description: string;
  status: boolean;
  duration?: number;
  title?: string;
  note?: string;
  deadlineTime: Date;
  assignToId?: number;
  assignFromId?: number;

  scheduleType?: {
    description?: string;
    scheduleTypeId?: number;
    scheduleTypeName?: string;
    status?: boolean;
  };

  createById?: number;
  createBy?: {
    userId?: number;
    userName?: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    image?: string;
    createdDate?: Date;
    updatedDate?: Date;
    status?: string;
  };

  assignTo?: {
    userId?: number;
    userName?: string;
  };

  assignFrom?: {
    userId?: number;
    userName?: string;
  };
};

export default Schedule;
