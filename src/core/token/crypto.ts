import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function deriveKey(secret: string): Buffer {
    return crypto.createHash('sha256').update(String(secret)).digest();
}

export function encryptPayload(payload: string, secret: string): string {
    const key = deriveKey(secret);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(payload, 'utf8', 'base64url');
    encrypted += cipher.final('base64url');
    const authTag = cipher.getAuthTag().toString('base64url');
    return `${iv.toString('base64url')}.${encrypted}.${authTag}`;
}

export function decryptPayload(encryptedToken: string, secret: string): string {
    const parts = encryptedToken.split('.');
    if (parts.length !== 3) throw new Error('INVALID_TOKEN_FORMAT');
    const [ivStr, encryptedStr, authTagStr] = parts;
    const key = deriveKey(secret);
    const iv = Buffer.from(ivStr, 'base64url');
    const authTag = Buffer.from(authTagStr, 'base64url');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedStr, 'base64url', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}