import type { Invoice } from '../types';
import { daysAgo } from '../lib/dates';

export function generateInvoices(): Invoice[] {
  return [
    {
      id: 'inv-1',
      date: daysAgo(5),
      amount: 0,
      status: 'paid',
      description: 'Free Plan — April 2026',
    },
    {
      id: 'inv-2',
      date: daysAgo(35),
      amount: 0,
      status: 'paid',
      description: 'Free Plan — March 2026',
    },
    {
      id: 'inv-3',
      date: daysAgo(65),
      amount: 0,
      status: 'paid',
      description: 'Free Plan — February 2026',
    },
  ];
}
