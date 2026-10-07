import 'dotenv/config';
import express from 'express';
import postsRouter from './routes/postsRoutes.js';
import communitiesRouter from './routes/communitiesRoutes.js';
import geocodeRoutes from './routes/geocodeRoutes.js'
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.use(postsRouter);
app.use(communitiesRouter);
app.use(geocodeRoutes)

export default app