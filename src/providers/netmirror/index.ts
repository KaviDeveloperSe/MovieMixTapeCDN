import { StreamProvider, ResolvedStream } from '../types';
import { resolvenetmirrorStream } from './resolver';
import { TokenPayload } from '../../core/token/types';

export class netmirrorProvider implements StreamProvider {
    name = 'netmirror';

    async resolve(payload: TokenPayload): Promise<ResolvedStream> {
        return await resolvenetmirrorStream(payload);
    }
}