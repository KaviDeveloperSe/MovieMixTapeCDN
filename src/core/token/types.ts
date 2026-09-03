export interface TokenPayload {
    v: number;
    provider: string;
    url: string;
    filename: string;
    mode: 'stream' | 'download';
    iat: number;
    exp: number;
}