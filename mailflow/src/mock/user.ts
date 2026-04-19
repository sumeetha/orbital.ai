import type { User } from '../types';

export const currentUser: User = {
  id: 'user-1',
  name: 'Maya Chen',
  email: 'maya@mailflow.demo',
  role: 'owner',
  plan: 'free',
  avatarUrl: undefined,
};

export const teammates: User[] = [
  { id: 'user-2', name: 'Devon Brooks', email: 'devon@mailflow.demo', role: 'admin', plan: 'free' },
  { id: 'user-3', name: 'Priya Sharma', email: 'priya@mailflow.demo', role: 'editor', plan: 'free' },
  { id: 'user-4', name: 'Alex Kim', email: 'alex@mailflow.demo', role: 'editor', plan: 'free' },
  { id: 'user-5', name: 'Jordan Lee', email: 'jordan@mailflow.demo', role: 'viewer', plan: 'free' },
];
