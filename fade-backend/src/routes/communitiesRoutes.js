import db from '../db.js'
import { Router } from 'express'

const router = Router()

// Keep in sync with MAX_NAME_LENGTH in fade-frontend/src/components/CreateCommunityModal.tsx
const MAX_NAME_LENGTH = 40

router.get('/communities', async (req, res) => {
    try {
        // Extra fields for the board cards: lat and lon read back out of the PostGIS point (for the
        // maps), plus note_count and last_note_at (when the newest one was pinned), both counting
        // unexpired notes only
        const result = await db.query(`
            SELECT c.*,
                ST_Y(c.geom::geometry) AS lat,
                ST_X(c.geom::geometry) AS lon,
                (SELECT COUNT(*) FROM posts p WHERE p.community_id = c.id AND p.expires_at > NOW())::int AS note_count,
                (SELECT MAX(p.created_at) FROM posts p WHERE p.community_id = c.id AND p.expires_at > NOW()) AS last_note_at
            FROM communities c`)
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

    // Long names don't fit the board cards, so they're capped here as well as in the form
    if (typeof name !== 'string' || name.trim().length > MAX_NAME_LENGTH) {
        return res.status(400).json({ error: `Community name must be ${MAX_NAME_LENGTH} characters or fewer`})
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