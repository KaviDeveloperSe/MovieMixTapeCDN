import pino from 'pino';
import { config } from '../config/env';

const transport = config.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
        colorize: true,
        translateTime: 'SYS:standard'
    }
} : undefined;

export const logger = pino({
    level: config.LOG_LEVEL,
    redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie'],
        remove: true
    },
    ...(transport ? { transport } : {})
});