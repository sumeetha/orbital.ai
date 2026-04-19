import type { Segment } from '../types';

export function generateSegments(contactCount: number): Segment[] {
  return [
    {
      id: 'segment-all',
      name: 'All contacts',
      rules: [],
      contactCount,
    },
    {
      id: 'segment-engaged',
      name: 'Engaged last 30d',
      rules: [{ type: 'engagement', op: 'opened' }],
      contactCount: Math.floor(contactCount * 0.6),
    },
    {
      id: 'segment-new',
      name: 'New signups',
      rules: [{ type: 'signupDate', op: 'after', value: new Date(Date.now() - 30 * 86400000).toISOString() }],
      contactCount: Math.floor(contactCount * 0.3),
    },
    {
      id: 'segment-vip',
      name: 'VIPs',
      rules: [{ type: 'tag', op: 'is', value: 'vip' }],
      contactCount: Math.min(10, contactCount),
    },
  ];
}
