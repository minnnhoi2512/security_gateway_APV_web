import VisitDetail from "./visitDetailType";

type VisitDetailList = {
  expectedStartTime?: Date | null;
  expectedEndTime?: Date | null;
  acceptLevel?: number;
  visitName?: string;
  description?: string;
  visitQuantity: number;
  scheduleId: number;
  visitType?: string;
  createById?: number;
  updateById?: number;
  daysOfProcess?: string;
  visitDetailOfNewVisitor? : VisitDetail[];
  visitDetailOfOldVisitor? : VisitDetail[];
  visitDetail?: VisitDetail[];
};

export default VisitDetailList;
