import { StreamProvider, ResolvedStream } from '../types';
import { resolveVidlinkStream } from './resolver';
import { TokenPayload } from '../../core/token/types';

export class VidlinkProvider implements StreamProvider {
    name = 'vidlink';

    async resolve(payload: TokenPayload): Promise<ResolvedStream> {
        return await resolveVidlinkStream(payload);
    }
}