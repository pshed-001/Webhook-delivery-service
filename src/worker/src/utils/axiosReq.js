import axios from "axios";
import logger from "../../../shared/logger/logger.js";

export async function axiosReq(callbackUrl, eventData, header, timeout = 30000) {
    //try catch block to cathc axios errors
    try {
        // send request with axios to the subscription callback url 
        // using post request and the necessary headers and body attached
        const request = await axios({
            method: "post",
            url: callbackUrl,
            data: eventData,
            timeout,
            headers: {
                "Content-Type": "application/json",
                "x-webhook-signature": header,
                "x-times": Date.now().toString()
            },
            validateStatus: () => true // Accept all status codes to handle them manually
        })
        logger.info({
            message: "Axios request sent",
            callbackUrl,
            method: "POST",
        });
        return {
            success: request.status >= 200 && request.status < 300,
            status: request.status,
            data: request.data,
            headers: Object.fromEntries(Object.entries(request.headers)),
            type: null,
            error: null
        }

    } catch (err) {
        if (axios.isAxiosError(err)) {

            logger.error({
                message: "Axios request failed",
                status: null,
                code: err.code,
                stack: err.stack,
                error: err.message
            })
            return {
                success: false,
                status: null,
                type: err.code,
                data: null,
                headers: {},
                error: err.message
            }
        }
        logger.error({
            message: "Non-Axios request failed",
            error: err.message,
            stack: err.stack
        })
        return {
            success: false,
            type: "NON_AXIOS_ERROR",
            error: err.message,
            status: null,
            data: null,
            headers: {}
        }
    }

}
// axios req tested manaually and confirmed : 
// return consistent value