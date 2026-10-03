import db from '../db.js'
import { Router } from 'express'

const router = Router()

router.get('/communities', async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM communities")
        return res.status(200).json(result.rows)
    } catch (e) {
        console.error(`Error: ${e}`)
        return res.status(500).json({ error: "500 Internal Server Error"})
    }
})

router.post('/communities', async (req,res) => {
    const { name, description, location, lat, lon } = req.body

    if (!name) {
        return res.status(400).json({ error: "Community name must be present"})
    }

    // Coordinates are required, but optional for now
    const hasLat = lat != null
    const hasLon = lon != null
    if (hasLat !== hasLon) {
        return res.status(400).json({ error: "Latitude and longitude must be provided together"})
    }

    if (hasLat && hasLon) {
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
            return res.status(400).json({ error: "Latitude and longitude must both be numbers"})
        }
        if (lat < -90 || lat > 90) {
            return res.status(400).json({ error: "Latitude must be between -90 and 90"})
        }
        if (lon < -180 || lon > 180) {
            return res.status(400).json({ error: "Longitude must be between -180 and 180"})
        }
    }

    try {
        const result = await db.query("INSERT INTO communities (name, description, location, geom) VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography) RETURNING *", [name, description, location, lon, lat])
        return res.status(201).json(result.rows[0])
    } catch (e) {
        console.error(`Error: ${e}`)
        return res.status(500).json({ error: "500 Internal Server Error"})
    }
})

router.delete('/communities/:id', async (req, res) => {
    const communityCheck = await db.query('SELECT * FROM communities WHERE id = $1', [req.params.id])
    if (communityCheck.rows.length == 0) {
        return res.status(404).json({ error: "404 Not Found"})
    }

    try {
        const result = await db.query("DELETE FROM communities WHERE id = $1 RETURNING *", [req.params.id])
        return res.status(204).json(result.rows)
    } catch (e) {
        console.error(`Error: ${e}`)
        return res.status(500).json({ error: "500 Internal Server Error"})
    }
})

export default router