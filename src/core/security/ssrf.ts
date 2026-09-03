import { ApplicationError } from '../../utils/errors';

const BANNED_HOSTS = ['localhost', '127.0.0.1', '::1', '0.0.0.0', '169.254.169.254'];

export function validateUpstreamUrl(url: string) {
    try {
        const parsed = new URL(url);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new ApplicationError('SSRF_DETECTED', 'Invalid protocol', 400);
        if (BANNED_HOSTS.includes(parsed.hostname.toLowerCase())) throw new ApplicationError('SSRF_DETECTED', 'Upstream URL points to a forbidden host', 400);
    } catch (e) {
        if (e instanceof ApplicationError) throw e;
        throw new ApplicationError('INVALID_URL', 'Failed to parse upstream URL', 400);
    }
}