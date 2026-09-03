import { Readable } from 'node:stream';
import { FastifyReply } from 'fastify';
import { OriginResponse } from '../origin/types';

export async function pipeOriginResponse(originRes: OriginResponse, reply: FastifyReply): Promise<void> {
    reply.status(originRes.status);

    const safeHeaders = ['content-type', 'content-length', 'content-range', 'accept-ranges', 'etag', 'last-modified', 'cache-control'];

    originRes.headers.forEach((value, key) => {
        if (safeHeaders.includes(key.toLowerCase())) reply.header(key, value);
    });

    if (!originRes.body) return reply.send();

    const nodeStream = Readable.fromWeb(originRes.body as any, { highWaterMark: 10485760 });

    return reply.send(nodeStream);
}