import { FetchBaseQueryError } from "@reduxjs/toolkit/query";


interface ErrorFormObject {
    [key: string|number]: string |  ErrorFormObject | ErrorFormObject[];
}
interface EntityError {
    status: 400;
    data: {
        errors:ErrorFormObject;
    }
}


export function isFerchBaseQueryError(error: unknown): error is FetchBaseQueryError {
    return typeof error === "object" && error !== null && "status" in error;
}


export function isErrorWithMessage(error: unknown): error is { message: string } {
    return typeof error === "object" && error !== null && "message" in error && typeof (error as any).message === "string";
}


export function isEntityError(error: unknown): error is EntityError {
    return (
        isFerchBaseQueryError(error) &&
        error.status === 400 &&
        typeof error.data === "object" &&
        error.data !== null 
        //!(error.data instanceof Array)
    )
}