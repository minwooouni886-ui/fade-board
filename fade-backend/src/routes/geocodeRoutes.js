import { Router } from 'express'
import geocode from '../geocode.js'
import { rateLimit } from 'express-rate-limit'

const router = Router()
const limiter = rateLimit({
    windowMs: 60_000,
    limit: 20,
    message: "Too many requests from this IP"
})

router.get('/geocode', limiter, async (req, res) => {
    if (!req.query.q?.trim()) {
        return res.status(400).json({ error: "Search text must be present"})
    }

    try {
        const locationList = await geocode(req.query.q)
        return res.status(200).json(locationList)
    } catch (e) {
        console.error(e)
        return res.status(e.status ?? 502).json({ error: e.status === 429 ? e.message : "Location service unavailable"})
    }
})

export default router