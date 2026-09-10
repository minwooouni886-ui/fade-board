import 'dotenv/config'
import express from 'express'
import postsRouter from './routes/postsRoutes.js'
import communitiesRouter from './routes/communitiesRoutes.js'

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(postsRouter)
app.use(communitiesRouter)

app.listen(port, () => {
  console.log(`Fade backend listening on http://localhost:${port}`);
});
