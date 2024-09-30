type User = {
    userId : number,
    username : string,
    password : string,
    fullName : string,
    email : string,
    image? : string,
    phoneNumber: string,
    createDate? : Date,
    updateDate?: Date,
    status : string,
    roleId : number 
}

export default User