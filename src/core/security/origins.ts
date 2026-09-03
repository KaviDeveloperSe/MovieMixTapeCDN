import { ApplicationError } from '../../utils/errors';

export function validateClientOrigin(requestOrigin: string | undefined, requestReferer: string | undefined, allowedOrigins: string) {
    if (allowedOrigins === '*') return;

    const allowedList = allowedOrigins.split(',').map(o => o.trim().toLowerCase());
    let clientOrigin = requestOrigin;

    if (!clientOrigin && requestReferer) {
        try {
            const url = new URL(requestReferer);
            clientOrigin = url.origin;
        } catch { }
    }

    if (!clientOrigin) return;

    if (!allowedList.includes(clientOrigin.toLowerCase())) throw new ApplicationError('UNAUTHORIZED_ORIGIN', `Origin ${clientOrigin} is not allowed to access this resource.`, 403);
}