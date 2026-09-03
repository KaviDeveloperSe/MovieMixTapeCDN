import { OriginRequestOptions, OriginResponse } from './types';
import { formatRangeHeader } from '../range/parser';
import { ApplicationError } from '../../utils/errors';
import { Agent } from 'undici';

const proxyAgent = new Agent({ connections: 1000, pipelining: 10, keepAliveTimeout: 30000, keepAliveMaxTimeout: 60000 });

export async function fetchFromOrigin(options: OriginRequestOptions): Promise<OriginResponse> {
    const fetchHeaders = new Headers();

    if (options.headers) {
        for (const [key, value] of Object.entries(options.headers)) {
            fetchHeaders.set(key, value);
        }
    }

    if (options.range) {
        fetchHeaders.set('Range', formatRangeHeader(options.range));
    }

    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), options.timeoutMs);

    const abortHandler = () => {
        timeoutController.abort();
    };

    options.abortSignal.addEventListener('abort', abortHandler, { once: true });

    try {
        const response = await fetch(options.url, { method: options.method, headers: fetchHeaders, signal: timeoutController.signal, redirect: 'follow', dispatcher: proxyAgent } as RequestInit);

        clearTimeout(timeoutId);
        options.abortSignal.removeEventListener('abort', abortHandler);

        if (response.status >= 500) throw new ApplicationError('ORIGIN_BAD_RESPONSE', `Upstream returned status ${response.status}`, 502);

        return { status: response.status, headers: response.headers, body: response.body };
    } catch (error: any) {
        clearTimeout(timeoutId);
        options.abortSignal.removeEventListener('abort', abortHandler);

        if (error instanceof ApplicationError) {
            throw error;
        }

        if (error.name === 'AbortError') {
            if (options.abortSignal.aborted) {
                throw new ApplicationError('CLIENT_DISCONNECTED', 'Client disconnected before origin responded', 499);
            } else {
                throw new ApplicationError('ORIGIN_TIMEOUT', 'Upstream origin timed out waiting for headers', 504);
            }
        }

        throw new ApplicationError('ORIGIN_UNAVAILABLE', `Failed to connect to origin: ${error.message}`, 502);
    }
}