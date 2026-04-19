import type { Contact } from '../types';
import { daysAgo } from '../lib/dates';

const firstNames = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
  'Isabella', 'Logan', 'Mia', 'Lucas', 'Charlotte', 'Jack', 'Amelia',
  'Aiden', 'Harper', 'Elijah', 'Evelyn', 'James', 'Aria', 'Benjamin',
  'Chloe', 'Henry', 'Ella', 'Sebastian', 'Luna', 'Owen', 'Grace', 'Caleb',
  'Scarlett', 'Daniel', 'Victoria', 'Matthew', 'Riley', 'Jackson', 'Layla',
  'David', 'Penelope', 'Carter', 'Lily', 'Wyatt', 'Hannah', 'Julian',
  'Nora', 'Luke', 'Zoe', 'Gabriel', 'Stella', 'Anthony',
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
  'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
  'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green',
  'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts',
];

export function generateContacts(): Contact[] {
  return firstNames.map((first, i) => {
    const last = lastNames[i];
    const tags: string[] = [];
    if (i < 10) tags.push('vip');
    if (i % 3 === 0) tags.push('newsletter');
    if (i % 5 === 0) tags.push('beta-tester');
    if (i % 7 === 0) tags.push('webinar-attendee');
    return {
      id: `contact-${i + 1}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      firstName: first,
      lastName: last,
      tags,
      subscribed: i !== 47,
      createdAt: daysAgo(Math.floor(Math.random() * 90) + 1),
    };
  });
}

export function generateImportedContacts(startIdx: number): Contact[] {
  const imported: Contact[] = [];
  for (let i = 0; i < 50; i++) {
    const idx = startIdx + i;
    imported.push({
      id: `contact-imported-${idx}`,
      email: `imported-user-${idx}@example.com`,
      firstName: `Imported`,
      lastName: `User ${idx}`,
      tags: ['imported'],
      subscribed: true,
      createdAt: new Date().toISOString(),
    });
  }
  return imported;
}
