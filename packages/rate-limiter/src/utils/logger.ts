import log4js from 'log4js';

log4js.addLayout('custom-tz', () => {
  return (loggingEvent) => {
    const date = new Date(loggingEvent.startTime);
    const formatter = new Intl.DateTimeFormat('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'America/Buenos_Aires',
    });
    
    const parts = formatter.formatToParts(date);
    const dateObj = Object.fromEntries(parts.map(p => [p.type, p.value]));
    
    const timestamp = `${dateObj.year}-${dateObj.month}-${dateObj.day} ${dateObj.hour}:${dateObj.minute}:${dateObj.second}.${loggingEvent.startTime.getMilliseconds().toString().padStart(3, '0')}`;
    const level = loggingEvent.level.toString();
    const message = loggingEvent.data.join(' ');
    
    return `[${timestamp}] [${level}] ${message}`;
  };
});

class Logger {
  private static instance: Logger;
  private logger: log4js.Logger;

  private constructor(loggerName: string = 'app') {
    log4js.configure({
      appenders: {
        console: {
          type: 'console',
          layout: {
            type: 'custom-tz',
          },
        },
        file: {
          type: 'file',
          filename: 'logs/app.log',
          layout: {
            type: 'custom-tz',
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
