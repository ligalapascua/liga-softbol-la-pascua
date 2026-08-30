// Caché offline con AsyncStorage + TTL por clave.
import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFIX = "@ligaSoftbol/cache/";

interface Entry<T> {
  ts: number;
  data: T;
}

export async function readCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as Entry<T>;
    return entry.data;
  } catch {
    return null;
  }
}

export async function readFresh<T>(key: string, ttlMs: number): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as Entry<T>;
    if (Date.now() - entry.ts > ttlMs) return null; // expirado
    return entry.data;
  } catch {
    return null;
  }
}

export async function writeCache<T>(key: string, data: T): Promise<void> {
  try {
    const entry: Entry<T> = { ts: Date.now(), data };
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // almacenamiento lleno u otro error: no bloquear
  }
}

export async function clearCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const ours = keys.filter((k) => k.startsWith(PREFIX));
    if (ours.length) await AsyncStorage.multiRemove(ours);
  } catch {
    // noop
  }
}
