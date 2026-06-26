import express from 'express';
import paymentRoutes from './routes/payments.routes';

const app = express();

app.use(express.json());
app.use('/rate-limited-payments', paymentRoutes);

export default app;
