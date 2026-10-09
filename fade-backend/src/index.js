import app from './app.js'
import deleteExpiredPosts from './cleanup.js';

const port = process.env.PORT || 3000;
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000

app.listen(port, () => {
  console.log(`Fade backend listening on http://localhost:${port}`);
});

// Call once on startup
deleteExpiredPosts()
setInterval(deleteExpiredPosts, CLEANUP_INTERVAL_MS).unref()