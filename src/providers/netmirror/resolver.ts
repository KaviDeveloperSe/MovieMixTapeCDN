import { TokenPayload } from '../../core/token/types';
import { ResolvedStream } from '../types';
import { getnetmirrorHeaders } from './headers';
import { ApplicationError } from '../../utils/errors';

export async function resolvenetmirrorStream(payload: TokenPayload): Promise<ResolvedStream> {
    if (!payload.url) throw new ApplicationError('INVALID_TOKEN_CONTENT', 'netmirror adapter requires a URL in the token payload.');
    if (!payload.url.startsWith('https://')) throw new ApplicationError('UNSUPPORTED_PROTOCOL', 'Upstream URL must use HTTPS.');

    return {
        provider: 'netmirror',
        url: payload.url,
        filename: payload.filename || 'movie.mp4',
        headers: getnetmirrorHeaders(payload.url),
    };
}