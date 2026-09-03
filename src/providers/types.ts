import { TokenPayload } from '../core/token/types';

export interface ResolvedStream {
    provider: string;
    url: string;
    quality?: string;
    mimeType?: string;
    filename?: string;
    headers?: Record<string, string>;
}

export interface ProviderHealth {
    provider: string;
    successRate: number;
    averageTtfbMs: number;
    averageMbps: number;
    rangeSupported: boolean;
    lastCheckedAt: number;
}

export interface StreamProvider {
    name: string;
    resolve(payload: TokenPayload): Promise<ResolvedStream>;
    healthCheck?(payload?: unknown): Promise<ProviderHealth>;
}