type VisitorSessionType = {
  visitorSessionId: Number;

  visitor: {
    visitorId: Number;
    visitorName: String;
    companyName: String;
  };
  qrCardId?: Number;
  visit : {
    visitId: Number;
    visitName: String;
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
  isVehicleSession? : Boolean;
  vehicleImage?: VehicleSessionRes | null; 
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

type VehicleImageRes = {
  vehicleSessionImageId: Number;
  imageType: String;
  imageURL: string;
};

type VehicleSessionRes = {
  images: VehicleImageRes[];
  licensePlate: String;
  status: String | null;
  vehicleSessionId: Number;
  visitorSessionId: Number;
};

export default VisitorSessionType;
