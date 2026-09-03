import Fastify from 'fastify';
import { config } from './config/env';
import streamRoutes from './routes/stream';
import downloadRoutes from './routes/download';
import { ApplicationError } from './utils/errors';
import cors from '@fastify/cors';
import { logger } from './observability/logger';

export function buildApp() {
    const app = Fastify({ loggerInstance: logger, disableRequestLogging: true, maxParamLength: 4096 });

    app.addHook('onRequest', (request, reply, done) => {
        request.log.info({ reqId: request.id, method: request.method, url: request.url, ip: request.ip }, 'Incoming request');
        done();
    });

    app.addHook('onResponse', (request, reply, done) => {
        request.log.info({ reqId: request.id, statusCode: reply.statusCode, responseTimeMs: reply.elapsedTime }, 'Request completed');
        done();
    });

    app.register(cors, {
        origin: (origin, cb) => {
            if (config.ALLOWED_ORIGINS.includes('*')) {
                cb(null, true);
                return;
            }
            if (!origin) {
                cb(null, true);
                return;
            }
            const allowedList = config.ALLOWED_ORIGINS.map(o => o.toLowerCase());
            if (allowedList.includes(origin.toLowerCase())) {
                cb(null, true);
            } else {
                cb(new Error('Not allowed by CORS'), false);
            }
        }
    });

    app.register(streamRoutes);

    app.register(downloadRoutes);

    app.get('/', async (request, reply) => {
        reply.send({
            name: 'MovieMixTapeCDN',
            status: 'online',
            version: '1.0.0'
        });
    });

    app.setErrorHandler((error, request, reply) => {
        if (error instanceof ApplicationError) {
            reply.status(error.status).send({
                success: false,
                error: {
                    code: error.code,
                    message: error.message,
                    requestId: request.id
                }
            });
            return;
        }

        const err = error as any;
        if (err.statusCode && err.statusCode < 500) {
            reply.status(err.statusCode).send({
                success: false,
                error: {
                    code: 'BAD_REQUEST',
                    message: err.message,
                    requestId: request.id
                }
            });
            return;
        }

        app.log.error(error);
        reply.status(500).send({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'An unexpected error occurred.',
                requestId: request.id
            }
        });
    });

    return app;
}