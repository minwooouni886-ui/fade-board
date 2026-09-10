import db from '../db.js'
import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
    res.send('Welcome to the beginning of Fade!')
})

router.get('/communities/:id/posts', async (req, res) => {
    const communityCheck = await db.query('SELECT * FROM communities WHERE id = $1', [req.params.id])
    if (communityCheck.rows.length == 0) {
        return res.status(404).json({ error: "404 Not Found"})
    }

    try {
        const result = await db.query('SELECT * FROM posts WHERE community_id = $1', [req.params.id])
        return res.status(200).json(result.rows)
    } catch (e) {
        console.error(`Error: ${e}`)
        return res.status(500).json({ error: "500 Internal Server Error"})
    }
})

router.get('/posts/:id' , (req, res)  => {
    // Get a specific post with id
})

router.post('/communities/:id/posts', async (req, res) => {
    const communityCheck = await db.query('SELECT * FROM communities WHERE id = $1', [req.params.id])
    if (communityCheck.rows.length == 0) {
        return res.status(404).json({ error: "404 Not Found"})
    }
    
    const { title, description, category, duration_hours } = req.body
    if (!title) {
        return res.status(400).json({ error: "Title and duration must be present"})
    }

    if (!duration_hours || duration_hours > 168 || duration_hours <= 0) {
        return res.status(400).json({ error: "Duration hours must be between 1 and 168 hours"})
    }

    try {
        const result = await db.query("INSERT INTO posts (community_id, title, description, category, expires_at) VALUES ($1, $2, $3, $4, NOW() + ($5 * INTERVAL '1 hour')) RETURNING *"
            , [req.params.id, title, description, category, duration_hours])
        return res.status(201).json(result.rows)
    } catch (e) {
        console.error(`Error: ${e}`)
        return res.status(500).json({ error: "500 Internal Server Error"})
    }
})

router.delete('/posts/:id', async (req, res) => {
    const postCheck = await db.query("SELECT * FROM posts WHERE id = $1", [req.params.id])
    if (postCheck.rows.length == 0) {
        return res.status(404).json({ error: "404 Not Found"})
    }

    try {
        const result = await db.query("DELETE FROM posts WHERE id = $1", [req.params.id])
        return res.status(204).send()
    } catch (e) {
        console.error(`Error: ${e}`)
        return res.status(500).json({ error: "500 Internal Server Error"})
    }
})

export default router