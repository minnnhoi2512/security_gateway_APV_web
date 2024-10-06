import Visitor from "./visitorType";

type VisitDetail = {
  visitDetailId?: number;
  visitId?: number;
  visitorId?: number;
  description?: string;
  expectedStartHour?: string;
  expectedEndHour?: string;
  status?: boolean;
  visitor?: Visitor;
};

export default VisitDetail;
