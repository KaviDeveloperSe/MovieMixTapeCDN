import { TokenPayload } from './types';
import { encryptPayload, decryptPayload } from './crypto';
import { ApplicationError } from '../../utils/errors';

export class TokenEngine {
    constructor(private readonly secret: string, private readonly ttlSeconds: number) { }

    createToken(params: Omit<TokenPayload, 'v' | 'iat' | 'exp'>): string {
        const now = Math.floor(Date.now() / 1000);
        const payload: TokenPayload = { v: 1, ...params, iat: now, exp: now + this.ttlSeconds };
        const json = JSON.stringify(payload);
        return encryptPayload(json, this.secret);
    }

    validateToken(encryptedToken: string): TokenPayload {
        let jsonStr: string;
        try {
            jsonStr = decryptPayload(encryptedToken, this.secret);
        } catch (error: any) {
            if (error.message === 'INVALID_TOKEN_FORMAT') throw new ApplicationError('INVALID_TOKEN', 'The streaming token format is invalid.');
            throw new ApplicationError('INVALID_SIGNATURE', 'The streaming token signature is invalid or tampered.', 401);
        }

        let payload: TokenPayload;
        try {
            payload = JSON.parse(jsonStr);
        } catch (error) {
            throw new ApplicationError('INVALID_TOKEN', 'The streaming token contains malformed data.');
        }

        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) throw new ApplicationError('TOKEN_EXPIRED', 'The streaming token has expired.', 401);

        if (payload.v !== 1) throw new ApplicationError('INVALID_TOKEN', 'Unsupported token version.');

        if (!payload.provider || !payload.url) throw new ApplicationError('INVALID_TOKEN', 'Token payload is missing required fields.');

        return payload;
    }
}