import { buildApp } from './app';
import { config } from './config/env';

const app = buildApp();
const signals = ['SIGINT', 'SIGTERM'];

async function start() {
    try {
        await app.listen({ port: config.PORT, host: '0.0.0.0' });
        app.log.info(`MovieMixTapeCDN listening on port ${config.PORT} in ${config.NODE_ENV} mode.`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

signals.forEach(signal => {
    process.on(signal, async () => {
        app.log.info(`Received ${signal}, initiating graceful shutdown...`);
        try {
            await app.close();
            app.log.info('Graceful shutdown complete.');
            process.exit(0);
        } catch (err) {
            app.log.error(err, 'Error during shutdown');
            process.exit(1);
        }
    });
});

start();