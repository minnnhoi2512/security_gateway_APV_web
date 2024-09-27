import Visitor from "./visitorType"

type VisitDetail = {
    visitDetailId : number,
    visitId? : number,
    expectedStartDate : Date,
    expectedEndDate : Date,
    expectedStartTime: Date,
    expectedEndTime : Date,
    status: number,
    visitor : Visitor,
}

export default VisitDetail