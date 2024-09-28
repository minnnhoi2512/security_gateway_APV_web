import Visitor from "./visitorType";

type VisitDetail = {
  visitDetailId?: number;
  visitId?: number;
  description?: string;
  expectedStartDate?: Date;
  expectedEndDate?: Date;
  expectedStartTime?: string;
  expectedEndTime?: string;
  expectedTimeIn?: string;
  expectedTimeOut?: string;
  status: boolean;
  visitor?: Visitor;
};

export default VisitDetail;
