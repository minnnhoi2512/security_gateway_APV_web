type ScheduleStaff = {
    id: Number;
    title: String;
    description : String;
    note: String;
    assignTime: Date;
    deadlineTime: Date;
    status: String;
    scheduleId: Number;
    assignToId: Number;
  };
  
  export default ScheduleStaff;
  