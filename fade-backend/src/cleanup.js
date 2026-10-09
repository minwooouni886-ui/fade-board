import db from './db.js'

export default async function deleteExpiredPosts() {
    try {
        await db.query('DELETE FROM posts WHERE expires_at < NOW() ')
    } catch (e) {
        console.error(e.message)
    }
}
