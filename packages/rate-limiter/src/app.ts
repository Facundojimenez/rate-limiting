import express from 'express';
import paymentRoutes from './routes/payments.routes';

const app = express();

app.use(express.json());
app.use(paymentRoutes);

export default app;
