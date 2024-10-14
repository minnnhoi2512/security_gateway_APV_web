type Visitor = {
    visitorId? : number,
    visitorName? : string,
    companyName? : string,
    phoneNumber?: string,
    visitorCredentialImage?: string,
    createdDate? : Date,
    updatedDate?: Date,
    status? : string,
    credentialsCard? : string,
    credentialCardTypeId?: number,
    visitorCredentialImageFromRequest?: File;
}

export default Visitor