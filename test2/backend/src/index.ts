import express from 'express';
import dotenv from 'dotenv';
import webhooksRoute from './routes/webhooks.route.js';

dotenv.config();
const app = express();
app.use('/api/webhooks', webhooksRoute);
app.use(express.json());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server listening on port ' + (process.env.PORT || 5000)));
