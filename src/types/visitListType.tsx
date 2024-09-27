type VisitList = {
  visitId: number;
  dateRegister: Date;
  visitName: string;
  visitQuantity: number;
  description: string;
  visitType: string;
  createdBy?: string;
  updatedBy?: string;
};

export default VisitList;
