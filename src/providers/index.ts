import { providerRegistry } from './registry';
import { VidlinkProvider } from './vidlink';

providerRegistry.register(new VidlinkProvider());

export { providerRegistry };
export * from './types';