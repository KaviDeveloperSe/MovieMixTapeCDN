import { StreamProvider } from './types';
import { ApplicationError } from '../utils/errors';

export class ProviderRegistry {
    private providers: Map<string, StreamProvider> = new Map();

    register(provider: StreamProvider): void {
        this.providers.set(provider.name.toLowerCase(), provider);
    }

    get(name: string): StreamProvider {
        const provider = this.providers.get(name.toLowerCase());
        if (!provider) {
            throw new ApplicationError('INVALID_PROVIDER', `Provider '${name}' is not registered or supported.`);
        }
        return provider;
    }
}

export const providerRegistry = new ProviderRegistry();