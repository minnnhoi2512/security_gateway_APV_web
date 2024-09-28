type Visitor = {
    visitorId? : number,
    visitorName : string,
    companyName : string,
    phoneNumber: string,
    createdDate : Date,
    updatedDate: Date,
    status? : boolean,
    credentialsCard : string,
    credentialCardTypeId: number;
}

export default Visitor