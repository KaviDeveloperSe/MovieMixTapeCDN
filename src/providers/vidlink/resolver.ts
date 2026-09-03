import { TokenPayload } from '../../core/token/types';
import { ResolvedStream } from '../types';
import { getVidlinkHeaders } from './headers';
import { ApplicationError } from '../../utils/errors';

export async function resolveVidlinkStream(payload: TokenPayload): Promise<ResolvedStream> {
    if (!payload.url) throw new ApplicationError('INVALID_TOKEN_CONTENT', 'Vidlink adapter requires a URL in the token payload.');
    if (!payload.url.startsWith('https://')) throw new ApplicationError('UNSUPPORTED_PROTOCOL', 'Upstream URL must use HTTPS.');

    return {
        provider: 'vidlink',
        url: payload.url,
        filename: payload.filename || 'movie.mp4',
        headers: getVidlinkHeaders(payload.url),
    };
}