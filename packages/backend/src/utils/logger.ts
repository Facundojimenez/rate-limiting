import log4js from 'log4js';

class Logger {
  private static instance: Logger;
  private logger: log4js.Logger;

  private constructor(loggerName: string = 'app') {
    log4js.configure({
      appenders: {
        console: {
          type: 'console',
          layout: {
            type: 'pattern',
            pattern: '[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] %m',
          },
        },
        file: {
          type: 'file',
          filename: 'logs/app.log',
          layout: {
            type: 'pattern',
            pattern: '[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] %m',
          },
        },
      },
      categories: {
        default: { appenders: ['console', 'file'], level: 'info' },
      },
    });

    this.logger = log4js.getLogger(loggerName);
  }

  public static getInstance(loggerName: string = 'app'): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(loggerName);
    }
    return Logger.instance;
  }

  public info(message: string, ...args: any[]): void {
    this.logger.info(message, ...args);
  }

  public warning(message: string, ...args: any[]): void {
    this.logger.warn(message, ...args);
  }

  public error(message: string, ...args: any[]): void {
    this.logger.error(message, ...args);
  }
}

export default Logger.getInstance();
