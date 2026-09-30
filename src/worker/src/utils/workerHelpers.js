// this file is an helper file that contains 
// different helpers in different domain of this application

// a function that parse the retry after provided by the http header
export function parseRetryAfter(number) {
    const seconds = Number(number)
    if (!Number.isNaN(seconds)) {
        return new Date(Date.now() + seconds * 1000)
    }
    const asDate = new Date(number)
    return Number.isNaN(asDate.getTime()) ? null : asDate
}

// afunction that compute the retry after from an attempt number and a base delay
export function computeNextRetry(attemptNum, baseDelay) {
    const delay = Number(baseDelay)
    const delayMs = delay * Math.pow(2, attemptNum - 1)
    
    return new Date(Date.now() + delayMs * 1000)
}