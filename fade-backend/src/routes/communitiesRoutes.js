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
    const { name, description, location } = req.body

    if (!name) {
        return res.status(400).json({ error: "Community name must be present"})
    }

    try {
        const result = await db.query("INSERT INTO communities (name, description, location) VALUES ($1, $2, $3) RETURNING *", [name, description, location])
        return res.status(201).json(result.rows)
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