import express from 'express';
import healthRoutes from './routes/health.routes';
import paymentRoutes from './routes/payment.routes';
import loggingMiddleware from './middleware/logging.middleware';

const app = express();

app.use(express.json());
app.use(loggingMiddleware());

app.use('/health', healthRoutes);
app.use('/payments', paymentRoutes);

export default app;
