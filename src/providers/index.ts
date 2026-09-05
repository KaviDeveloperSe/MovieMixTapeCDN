import { providerRegistry } from './registry';
import { netmirrorProvider } from './netmirror';

providerRegistry.register(new netmirrorProvider());

export { providerRegistry };
export * from './types';