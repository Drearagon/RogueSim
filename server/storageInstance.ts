import type { DatabaseStorage } from './storage';

let storageInstance: DatabaseStorage | null = null;

export function setStorageInstance(instance: DatabaseStorage): void {
    storageInstance = instance;
}

export function getStorageInstance(): DatabaseStorage {
    if (!storageInstance) {
        throw new Error('Storage instance has not been initialized yet.');
    }
    return storageInstance;
}
