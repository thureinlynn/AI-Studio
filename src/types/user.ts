import { TravelerContact } from './trip';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio: string;
  isVerified: boolean;
  contacts: TravelerContact;
  tripsCount: number;
  languages: string[];
  createdAt?: string;
  memberSince?: string;
}
