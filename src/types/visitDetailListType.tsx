import VisitDetail from "./visitDetailType";

type VisitDetailList = {
    dateRegister: Date;
    visitQuantity: number;
    visitType: string;
    daysOfProcess: string;
    visitDetail : VisitDetail[]
  };
  
  export default VisitDetailList;
  