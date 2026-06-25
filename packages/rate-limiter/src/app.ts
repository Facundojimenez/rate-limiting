import express from 'express';
import proxyRoutes from './routes/proxy.routes';

const app = express();

app.use(express.json());
app.use('/', proxyRoutes);

export default app;
