import VisitDetail from "./visitDetailType";

type VisitDetailList = {
  dateRegister?: Date;
  acceptLevel?: number;
  visitName?: string;
  visitQuantity: number;
  visitType?: string;
  createById?: number;
  updateById?: number;
  daysOfProcess?: string;
  visitDetailOfNewVisitor? : VisitDetail[];
  visitDetailOfOldVisitor? : VisitDetail[];
  visitDetail?: VisitDetail[];
};

export default VisitDetailList;
