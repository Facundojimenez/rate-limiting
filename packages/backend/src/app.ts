import express from 'express';
import paymentRoutes from './routes/payment.routes';

const app = express();

app.use(express.json());
app.use('/payments', paymentRoutes);

export default app;
