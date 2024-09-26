import Visitor from "./visitorType"

type VisitDetail = {
    VisitDetailId : number,
    VisitId? : number,
    ExpectedStartDate : Date,
    ExpectedEndDate : Date,
    ExpectedStartTime: Date,
    ExpectedEndTime : Date,
    Status: number,
    Visitor : Visitor,
}

export default VisitDetail