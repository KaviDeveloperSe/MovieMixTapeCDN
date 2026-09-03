import { ParsedRange } from '../range/types';

export interface OriginRequestOptions {
    url: string;
    method: 'GET' | 'HEAD';
    headers?: Record<string, string>;
    range?: ParsedRange;
    abortSignal: AbortSignal;
    timeoutMs: number;
}

export interface OriginResponse {
    status: number;
    headers: Headers;
    body: ReadableStream<Uint8Array> | null;
}