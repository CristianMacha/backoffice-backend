import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

export function createWinstonConfig(nodeEnv: string): WinstonModuleOptions {
  const isProd = nodeEnv === 'production';

  const transports: winston.transport[] = [
    new winston.transports.Console({
      level: isProd ? 'info' : 'debug',
      format: isProd
        ? winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          )
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: 'HH:mm:ss' }),
            winston.format.printf(
              ({ level, message, timestamp, context, requestId, ...meta }) => {
                const reqPart = requestId
                  ? ` (reqId=${requestId as string})`
                  : '';
                const metaPart = Object.keys(meta).length
                  ? ` ${JSON.stringify(meta)}`
                  : '';
                return `${timestamp as string} [${(context as string) ?? 'App'}] ${level}: ${message as string}${reqPart}${metaPart}`;
              },
            ),
          ),
    }),
  ];

  if (isProd) {
    transports.push(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
      }),
      new winston.transports.File({ filename: 'logs/combined.log' }),
    );
  }

  return { transports };
}
