import fs from 'fs';
import path from 'path';
import type { TripPost } from '../src/types/trip.ts';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  isVerified?: boolean;
  contacts?: {
    whatsapp?: string;
    viber?: string;
    telegram?: string;
    preferred?: string;
  };
  rating?: number;
  tripsCompleted?: number;
  memberSince?: string;
  languages?: string[];
  createdAt?: string;
}

// In-memory cache
let inMemoryTrips: TripPost[] = [];
let inMemoryUsers: UserAccount[] = [];
let isInitialized = false;

// KV Configuration (Vercel KV / Upstash Redis native integration)
function getKvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.VERCEL_KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.VERCEL_KV_REST_API_TOKEN;
  if (url && token) {
    return { url: url.replace(/\/+$/, ''), token };
  }
  return null;
}

async function getKvData<T>(key: string): Promise<T | null> {
  const kv = getKvConfig();
  if (!kv) return null;
  try {
    const res = await fetch(`${kv.url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${kv.token}` },
    });
    if (!res.ok) return null;
    const body: any = await res.json();
    if (body && body.result !== null && body.result !== undefined) {
      if (typeof body.result === 'string') {
        try {
          return JSON.parse(body.result);
        } catch {
          return body.result as unknown as T;
        }
      }
      return body.result as T;
    }
  } catch (err) {
    console.warn(`[Vercel KV] Error reading key "${key}":`, err);
  }
  return null;
}

async function setKvData<T>(key: string, value: T): Promise<boolean> {
  const kv = getKvConfig();
  if (!kv) return false;
  try {
    const stringVal = JSON.stringify(value);
    const res = await fetch(`${kv.url}/set/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kv.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([stringVal]),
    });
    return res.ok;
  } catch (err) {
    console.warn(`[Vercel KV] Error writing key "${key}":`, err);
    return false;
  }
}

// Local File Paths
const TMP_TRIPS = path.join('/tmp', 'trips.json');
const TMP_USERS = path.join('/tmp', 'users.json');
const LOCAL_DATA_DIR = path.resolve(process.cwd(), 'data');
const LOCAL_TRIPS = path.join(LOCAL_DATA_DIR, 'trips.json');
const LOCAL_USERS = path.join(LOCAL_DATA_DIR, 'users.json');

function readFileTrips(): TripPost[] {
  // 1. Try /tmp (serverless latest writes)
  try {
    if (fs.existsSync(TMP_TRIPS)) {
      const content = fs.readFileSync(TMP_TRIPS, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}

  // 2. Fallback to data/trips.json from repository bundle
  try {
    if (fs.existsSync(LOCAL_TRIPS)) {
      const content = fs.readFileSync(LOCAL_TRIPS, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        try {
          fs.writeFileSync(TMP_TRIPS, content, 'utf-8');
        } catch {}
        return parsed;
      }
    }
  } catch {}

  return [];
}

function writeFileTrips(trips: TripPost[]) {
  const json = JSON.stringify(trips, null, 2);

  // Always write to /tmp (writable in Vercel serverless)
  try {
    fs.writeFileSync(TMP_TRIPS, json, 'utf-8');
  } catch (e) {
    console.warn('Failed writing /tmp/trips.json:', e);
  }

  // Also write to data/ directory if writable (e.g. Node dev server / Cloud Run)
  try {
    if (!fs.existsSync(LOCAL_DATA_DIR)) {
      fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_TRIPS, json, 'utf-8');
  } catch {}
}

function readFileUsers(): UserAccount[] {
  try {
    if (fs.existsSync(TMP_USERS)) {
      const content = fs.readFileSync(TMP_USERS, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}

  try {
    if (fs.existsSync(LOCAL_USERS)) {
      const content = fs.readFileSync(LOCAL_USERS, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        try {
          fs.writeFileSync(TMP_USERS, content, 'utf-8');
        } catch {}
        return parsed;
      }
    }
  } catch {}

  return [];
}

function writeFileUsers(users: UserAccount[]) {
  const json = JSON.stringify(users, null, 2);
  try {
    fs.writeFileSync(TMP_USERS, json, 'utf-8');
  } catch {}
  try {
    if (!fs.existsSync(LOCAL_DATA_DIR)) {
      fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_USERS, json, 'utf-8');
  } catch {}
}

// Initialize from file storage synchronously on startup
function initStorageSync() {
  if (isInitialized) return;
  inMemoryTrips = readFileTrips();
  inMemoryUsers = readFileUsers();
  isInitialized = true;
}

// Trips API
export async function getAllTrips(): Promise<TripPost[]> {
  initStorageSync();

  // Try Vercel KV if available
  const kvTrips = await getKvData<TripPost[]>('luukyone_trips');
  if (kvTrips && Array.isArray(kvTrips)) {
    inMemoryTrips = kvTrips;
    writeFileTrips(kvTrips);
    return inMemoryTrips;
  }

  // Reload from file in case another serverless invocation wrote to /tmp
  const fileTrips = readFileTrips();
  if (fileTrips.length > 0 || inMemoryTrips.length === 0) {
    inMemoryTrips = fileTrips;
  }

  return inMemoryTrips;
}

export function getAllTripsSync(): TripPost[] {
  initStorageSync();
  const fileTrips = readFileTrips();
  if (fileTrips.length > 0) inMemoryTrips = fileTrips;
  return inMemoryTrips;
}

export async function saveTrip(newTrip: TripPost): Promise<TripPost> {
  await getAllTrips();
  inMemoryTrips = [newTrip, ...inMemoryTrips.filter((t) => t.id !== newTrip.id)];
  writeFileTrips(inMemoryTrips);
  await setKvData('luukyone_trips', inMemoryTrips);
  return newTrip;
}

export async function updateTripStatus(
  id: string,
  status: 'active' | 'fully_booked' | 'completed'
): Promise<TripPost | null> {
  await getAllTrips();
  const index = inMemoryTrips.findIndex((t) => t.id === id);
  if (index === -1) return null;
  inMemoryTrips[index] = {
    ...inMemoryTrips[index],
    status,
  };
  writeFileTrips(inMemoryTrips);
  await setKvData('luukyone_trips', inMemoryTrips);
  return inMemoryTrips[index];
}

export async function deleteTripById(id: string): Promise<boolean> {
  await getAllTrips();
  const initialLength = inMemoryTrips.length;
  inMemoryTrips = inMemoryTrips.filter((t) => t.id !== id);
  if (inMemoryTrips.length !== initialLength) {
    writeFileTrips(inMemoryTrips);
    await setKvData('luukyone_trips', inMemoryTrips);
    return true;
  }
  return false;
}

// Users API
export async function getAllUsers(): Promise<UserAccount[]> {
  initStorageSync();
  const kvUsers = await getKvData<UserAccount[]>('luukyone_users');
  if (kvUsers && Array.isArray(kvUsers)) {
    inMemoryUsers = kvUsers;
    writeFileUsers(kvUsers);
    return inMemoryUsers;
  }
  const fileUsers = readFileUsers();
  if (fileUsers.length > 0 || inMemoryUsers.length === 0) {
    inMemoryUsers = fileUsers;
  }
  return inMemoryUsers;
}

export async function findUserByEmail(email: string): Promise<UserAccount | null> {
  const users = await getAllUsers();
  const cleanEmail = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
}

export async function saveUser(user: UserAccount): Promise<UserAccount> {
  await getAllUsers();
  const cleanEmail = user.email.trim().toLowerCase();
  const existingIdx = inMemoryUsers.findIndex((u) => u.email.toLowerCase() === cleanEmail || u.id === user.id);
  if (existingIdx !== -1) {
    inMemoryUsers[existingIdx] = { ...inMemoryUsers[existingIdx], ...user };
  } else {
    inMemoryUsers.push(user);
  }
  writeFileUsers(inMemoryUsers);
  await setKvData('luukyone_users', inMemoryUsers);
  return user;
}
