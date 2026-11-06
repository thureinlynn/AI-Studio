import fs from 'fs';
import path from 'path';
import { TripPost } from '../src/types/trip';
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

// Storage paths: try data directory first, fallback to /tmp for read-only serverless filesystems
const DATA_DIR = path.resolve(process.cwd(), 'data');
const TMP_DIR = '/tmp';

function getStoragePath(filename: string): string {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    return path.join(DATA_DIR, filename);
  } catch {
    return path.join(TMP_DIR, filename);
  }
}

const TRIPS_FILE = getStoragePath('trips.json');
const USERS_FILE = getStoragePath('users.json');

// In-memory cache for fast access and serverless instances
let inMemoryTrips: TripPost[] = [];
let inMemoryUsers: UserAccount[] = [];
let isInitialized = false;

function initStorage() {
  if (isInitialized) return;

  // Load trips
  try {
    if (fs.existsSync(TRIPS_FILE)) {
      const data = fs.readFileSync(TRIPS_FILE, 'utf-8');
      inMemoryTrips = JSON.parse(data);
    } else {
      inMemoryTrips = [];
    }
  } catch (err) {
    console.error('Error reading trips file:', err);
    inMemoryTrips = [];
  }

  // Load users
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      inMemoryUsers = JSON.parse(data);
    } else {
      inMemoryUsers = [];
    }
  } catch (err) {
    console.error('Error reading users file:', err);
    inMemoryUsers = [];
  }

  isInitialized = true;
}

export function getAllTrips(): TripPost[] {
  initStorage();
  return inMemoryTrips;
}

export function saveTrip(newTrip: TripPost): TripPost {
  initStorage();
  // Prepend new trip
  inMemoryTrips = [newTrip, ...inMemoryTrips.filter(t => t.id !== newTrip.id)];
  persistTrips();
  return newTrip;
}

export function updateTripStatus(id: string, status: 'active' | 'fully_booked' | 'completed'): TripPost | null {
  initStorage();
  const index = inMemoryTrips.findIndex(t => t.id === id);
  if (index === -1) return null;
  inMemoryTrips[index] = {
    ...inMemoryTrips[index],
    status,
  };
  persistTrips();
  return inMemoryTrips[index];
}

export function deleteTripById(id: string): boolean {
  initStorage();
  const initialLength = inMemoryTrips.length;
  inMemoryTrips = inMemoryTrips.filter(t => t.id !== id);
  if (inMemoryTrips.length !== initialLength) {
    persistTrips();
    return true;
  }
  return false;
}

function persistTrips() {
  try {
    fs.writeFileSync(TRIPS_FILE, JSON.stringify(inMemoryTrips, null, 2), 'utf-8');
  } catch (err) {
    // In serverless, fallback to /tmp
    try {
      fs.writeFileSync(path.join(TMP_DIR, 'trips.json'), JSON.stringify(inMemoryTrips, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write trips to disk:', e);
    }
  }
}

// User accounts
export function getAllUsers(): UserAccount[] {
  initStorage();
  return inMemoryUsers;
}

export function findUserByEmail(email: string): UserAccount | null {
  initStorage();
  const cleanEmail = email.trim().toLowerCase();
  return inMemoryUsers.find(u => u.email.toLowerCase() === cleanEmail) || null;
}

export function saveUser(user: UserAccount): UserAccount {
  initStorage();
  const cleanEmail = user.email.trim().toLowerCase();
  const existingIdx = inMemoryUsers.findIndex(u => u.email.toLowerCase() === cleanEmail || u.id === user.id);
  if (existingIdx !== -1) {
    inMemoryUsers[existingIdx] = { ...inMemoryUsers[existingIdx], ...user };
  } else {
    inMemoryUsers.push(user);
  }
  persistUsers();
  return user;
}

function persistUsers() {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(inMemoryUsers, null, 2), 'utf-8');
  } catch (err) {
    try {
      fs.writeFileSync(path.join(TMP_DIR, 'users.json'), JSON.stringify(inMemoryUsers, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write users to disk:', e);
    }
  }
}
