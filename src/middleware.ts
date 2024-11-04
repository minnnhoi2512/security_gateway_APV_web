import { AnyAction, isRejected, isRejectedWithValue, Middleware, MiddlewareAPI } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

function isPayloadErrorMessage(payload: unknown): payload is {
    data: {
        code: string,
        message: string
    }
    status: number
} {
    return (
        typeof payload === 'object' &&
        payload !== null &&
        'data' in payload &&
        typeof (payload as any).data?.message === 'string'
    )
}
export const rtkQueryErrorLogger: Middleware = (api: MiddlewareAPI) => (next) => (action: AnyAction) => {
    //console.log("Check action", action);
    // Option: Trong thực tế không bắt buộc đến mức này!
    if (isRejected(action)) {
        if (action.error.name === 'CustomError') {
            // Những lỗi liên quan đến quá trình thực thi
            toast.warn(action.error.message)
        }
    }
    if (isRejectedWithValue(action)) {
        // Mỗi khi thực hiện query hoặc mutation mà bị lỗi thì nó sẽ chạy vào đây
        // Những lỗi từ server thì action nó mới có rejectedWithValue = true
        // Còn những action liên quan đến việc caching mà bị rejected thì rejectedWithValue = false, nên đừng lo lắng, nó không lọt vào đây được
        if (isPayloadErrorMessage(action.payload)) {
            // Lỗi reject từ server chỉ có message thôi!
            if (action.payload.data.code !== "Error.Visit") {
                toast.warn(action.payload.data.message);
            }
        }
    }
    return next(action);
};