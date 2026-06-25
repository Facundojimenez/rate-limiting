import 'dotenv/config';
import app from './app';
import rateLimitRules from './config/rules';
import logger from './utils/logger';

const PORT = process.env.PORT ?? 4000;

app.listen(PORT, () => {
  logger.info(`[SERVER] Rate limiter service started - port: ${PORT}`);
  logger.info(`[SERVER] Rate limiter rules loaded - ${JSON.stringify(rateLimitRules, null, 2)}`);
});
