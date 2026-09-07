import * as deliveryService from "./delivery.service.js"

export const getAllDeliveriesCtrl = async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 20

        const result = await deliveryService.fetchDeliveries(page, limit)
        res.status(200).json(result)
    } catch (err) {
        next(err)
    }
}

export const getSingleDelivery = async (req, res, next) => {
    try {
        const { id } = req.params
        const result = await deliveryService.getSpecificDelivery(id)
        res.status(200).json(result)
    } catch (err) {
        next(err)
    }
}

export const getEventDelivery = async (req, res, next) => {
    try {
        const { id } = req.params
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 20

        const result = await deliveryService.getEventDelivery(id, page, limit)
        res.status(200).json(result)
    } catch (err) {
        next(err)
    }
}