import * as subscriptionService from "./subscription.service.js"


export async function createSubscriptionCtrl(req, res, next) {
    try {
        const { callbackUrl, type, secret } = req.body
        const result = await
            subscriptionService.createSubscription(callbackUrl, secret, type)

        res.status(201).json(result)
    } catch (err) {
        next(err)
    }
}

export async function getSubscriptionCtrl(req, res, next) {
    try {
        const { page } = Number(req.query) || 1
        const { limit } = Number(req.query) || 20
        const result = await subscriptionService.getSubscriptions(page, limit)

        res.status(200).json(result)
    } catch (err) {
        next(err)
    }
}

export async function getSingleSubscriptionCtrl(req, res, next) {
    try {

        const { id } = req.param
        const result = await subscriptionService.getSingleSubscription(id)

        res.status(200).json(result)
    } catch (err) {
        next(err)
    }
}

export async function updateSubscriptionCtrl(req, res, next) {
    try {
        const { id } = req.param
        const result = await subscriptionService.updateSubscription(req.body, id)

        res.status(200).json(result)
    } catch (err) {
        next(err)
    }
}

export async function deleteSubcriptionCtrl(req, res, next) {
    try {
        const { id } = req.param
        const result = await subscriptionService.deleteSubscription(id)

        res.status(200).json(result)
    } catch (err) {
        next(err)
    }
}

//