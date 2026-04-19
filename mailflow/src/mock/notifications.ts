import type { Notification } from '../types';
import { hoursAgo, daysAgo } from '../lib/dates';

export function generateNotifications(): Notification[] {
  return [
    {
      id: 'notif-1',
      message: 'Newsletter #14 was sent to 1,250 recipients',
      read: false,
      createdAt: hoursAgo(2),
    },
    {
      id: 'notif-2',
      message: '42 new subscribers this week',
      read: false,
      createdAt: hoursAgo(8),
    },
    {
      id: 'notif-3',
      message: 'Your "Flash Sale" campaign hit 45% open rate!',
      read: true,
      createdAt: daysAgo(1),
    },
    {
      id: 'notif-4',
      message: 'Devon Brooks accepted your team invite',
      read: true,
      createdAt: daysAgo(2),
    },
    {
      id: 'notif-5',
      message: 'Automation "Welcome Series" sent 12 emails today',
      read: true,
      createdAt: daysAgo(3),
    },
  ];
}
