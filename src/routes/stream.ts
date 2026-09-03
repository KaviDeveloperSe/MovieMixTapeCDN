import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { TokenEngine } from '../core/token/token';
import { config } from '../config/env';
import { providerRegistry } from '../providers';
import { parseRange, validateRangeLimits } from '../core/range';
import { fetchFromOrigin } from '../core/origin';
import { pipeOriginResponse } from '../core/streaming';
import { sanitizeFilename } from '../core/security/filenames';
import { validateUpstreamUrl } from '../core/security/ssrf';

export const tokenEngine = new TokenEngine(config.STREAM_SECRET, config.TOKEN_TTL_SECONDS);

export default async function streamRoutes(fastify: FastifyInstance) {
    fastify.route({
        method: ['GET', 'HEAD'],
        url: '/stream/:token',
        handler: async (request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) => {
            const { token } = request.params;
            const isHead = request.method === 'HEAD';
            const payload = tokenEngine.validateToken(token);
            const provider = providerRegistry.get(payload.provider);
            const resolvedStream = await provider.resolve(payload);

            validateUpstreamUrl(resolvedStream.url);

            const rangeHeader = request.headers.range;
            const range = parseRange(rangeHeader);

            if (range) validateRangeLimits(range, config.MAX_RANGE_SIZE);

            const safeFilename = sanitizeFilename(resolvedStream.filename);

            reply.header('Content-Disposition', `inline; filename="${safeFilename}"`);
            reply.header('Accept-Ranges', 'bytes');

            const abortController = new AbortController();

            const onReqClose = () => {
                if (request.raw.destroyed || request.raw.closed) {
                    abortController.abort();
                }
            };

            request.raw.on('close', onReqClose);

            try {
                const originResponse = await fetchFromOrigin({ url: resolvedStream.url, method: isHead ? 'HEAD' : 'GET', headers: resolvedStream.headers, range: range || undefined, abortSignal: abortController.signal, timeoutMs: config.UPSTREAM_TIMEOUT_MS });
                await pipeOriginResponse(originResponse, reply);
            } finally {
                request.raw.removeListener('close', onReqClose);
            }
        }
    });
}