import * as eventService from "./event.service.js"

export const createEventCtrl = async (req, res, next) => {
    try {
        const { id, type, payload } = req.body
        const { success, message, data } = await
            eventService.createEvent(id, type, payload)

        return res.status(202).json({
            success, message, data
        })
    } catch (err) {
        next(err)
    }
}

export const fetchEventCtrl = async (req, res, next) => {
    try {
        const { id } = req.params
        const { success, message, data } = await
            eventService.fetchEvent(id)

        return res.status(200).json({
            success, message, data
        })
    } catch (err) {
        next(err)
    }
}

// finished the two event controller.

// added one more event controler to get all the available event data
export const fetchAlllEventCtrl = async (req, res, next) => {

    try {
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 20
        const response = await
            eventService.fetchAllEvents(page, limit)

        return res.status(200).json(response)
    } catch (err) {
        next(err)
    }
}