import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: number;
    STREAM_SECRET: string;
    ALLOWED_ORIGINS: string[];
    TOKEN_TTL_SECONDS: number;
    UPSTREAM_TIMEOUT_MS: number;
    MAX_RANGE_SIZE: number;
    LOG_LEVEL: string;
}

function parseOrigins(origins: string | undefined): string[] {
    if (!origins) return [];
    return origins.split(',').map(o => o.trim()).filter(Boolean);
}

function loadConfig(): AppConfig {
    const NODE_ENV = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
    const PORT = parseInt(process.env.PORT || '8080', 10);
    const STREAM_SECRET = process.env.STREAM_SECRET;
    if (!STREAM_SECRET || STREAM_SECRET.length < 32) throw new Error("FATAL: STREAM_SECRET environment variable is missing or too short. It must be at least 32 characters.");
    const ALLOWED_ORIGINS = parseOrigins(process.env.ALLOWED_ORIGINS);
    if (NODE_ENV === 'production' && ALLOWED_ORIGINS.length === 0) throw new Error("FATAL: ALLOWED_ORIGINS must be set in production to prevent open proxying.");
    const TOKEN_TTL_SECONDS = parseInt(process.env.TOKEN_TTL_SECONDS || '3600', 10);
    const UPSTREAM_TIMEOUT_MS = parseInt(process.env.UPSTREAM_TIMEOUT_MS || '15000', 10);
    const MAX_RANGE_SIZE = parseInt(process.env.MAX_RANGE_SIZE || '104857600', 10);
    const LOG_LEVEL = process.env.LOG_LEVEL || (NODE_ENV === 'production' ? 'info' : 'debug');
    return { NODE_ENV, PORT, STREAM_SECRET, ALLOWED_ORIGINS, TOKEN_TTL_SECONDS, UPSTREAM_TIMEOUT_MS, MAX_RANGE_SIZE, LOG_LEVEL };
}

export const config = loadConfig();