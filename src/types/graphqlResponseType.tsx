import VisitDetailList from "./VisitDetailListType"

type GrapqlResponseType ={
    data : Data
}
export default GrapqlResponseType
type Data = {
    visit : Items
}
type Items = {
    items : VisitDetailList[]
}

