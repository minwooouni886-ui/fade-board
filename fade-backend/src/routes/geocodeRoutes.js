import db from '../db.js'
import { Router } from 'express'
import geocode from '../geocode.js'

const router = Router()

router.get('/geocode', async (req, res) => {
    if (!req.query.q?.trim()) {
        return res.status(400).json({ error: "Search text must be present"})
    }

    try {
        const locationList = await geocode(req.query.q)
        return res.status(200).json(locationList)
    } catch (e) {
        return res.status(502).json({ error: "Location service unavailable"})
    }
})

export default router