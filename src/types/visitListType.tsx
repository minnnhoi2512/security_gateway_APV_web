type VisitList = {
  visitId: number;
  createTime?: Date;
  expectedStartTime: Date;
  expectedEndTime: Date;
  visitName: string;
  visitQuantity: number;
  description?: string;
  visitStatus: string;
  visitType?: string;
  schedule : {
    scheduleId: number;
    scheduleName: string;
    scheduleType: {
      scheduleTypeId: number;
      scheduleTypeName: string;
    };
  }
  createdBy?: string;
  updatedBy?: string;
};

export default VisitList;
