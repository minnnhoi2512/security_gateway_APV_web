import Visitor from "./visitorType";

export type DetailVisitor = {
  expectedEndHour: string;
  expectedStartHour: string;
  visitor: Visitor;
  status: boolean;
  visitorId? : number
};
