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
    credentialCardType :{
        credentialCardTypeId : number,
    }
    visitorCredentialImageFromRequest?: File;
    // visitorCredentialImage
}

export default Visitor