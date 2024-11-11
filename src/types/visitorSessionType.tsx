type VisitorSessionType = {
  visitorSessionId: Number;
  visitor: {
    visitorId: Number;
    visitorName: String;
    companyName: String;
  };
  visit : {
    visitId: Number;
  }
  checkinTime: Date;
  checkoutTime: Date;
  qRCardId?: Number;
  visitDetailId: Number;
  securityIn: SecurityRes;
  securityOut: SecurityRes;
  gateIn: GateRes;
  gateOut: GateRes;
  status: String;
  images: SessionsImageRes[];
};
type SecurityRes = {
  userId?: Number;
  fullName: String;
  phoneNumber?: String;
};
type GateRes = {
  gateId: Number;
  gateName: String;
};
type SessionsImageRes = {
  visitorSessionsImageId?: Number;
  imageType?: String;
  imageURL: string;
};

export default VisitorSessionType;
