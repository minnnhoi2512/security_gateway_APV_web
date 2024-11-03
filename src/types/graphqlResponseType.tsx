import VisitDetailList from "./VisitDetailListType"
import VisitorSessionType from "./visitorSessionType"

type GrapqlResponseType ={
    data : Data
}
export default GrapqlResponseType
type Data = {
    visit? : Items,
    visitorSession? :Items 
}
type Items = {
    items : VisitDetailList[] | VisitorSessionType[]
}
