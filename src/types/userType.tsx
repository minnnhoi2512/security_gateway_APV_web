type User = {
    userId?: number,
    userName : string,
    password : string,
    fullName : string,
    email : string,
    image? : string,
    phoneNumber: string,
    createDate? : Date,
    updateDate?: Date,
    status? : string,
    roleID? : number ,
    departmentId? : number 
}

export default User