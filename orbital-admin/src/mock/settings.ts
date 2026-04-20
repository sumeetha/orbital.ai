export type TeamRole = 'admin' | 'editor' | 'viewer';
export type MemberStatus = 'active' | 'invited';

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: MemberStatus;
  lastActive: string;
  avatarInitials: string;
};

export type BillingPlan = 'free' | 'pro' | 'enterprise';

export type BillingHistory = {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: 'paid' | 'pending' | 'failed';
};

export type BillingInfo = {
  currentPlan: BillingPlan;
  monthlyPrice: string;
  seatsUsed: number;
  seatsTotal: number;
  engagementsActive: number;
  engagementsLimit: number;
  paymentMethod: string;
  billingHistory: BillingHistory[];
};

export const mockTeamMembers: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'Sarah Kim',
    email: 'sarah@mailflow.io',
    role: 'admin',
    status: 'active',
    lastActive: 'Just now',
    avatarInitials: 'SK',
  },
  {
    id: 'tm-2',
    name: 'James Chen',
    email: 'james@mailflow.io',
    role: 'editor',
    status: 'active',
    lastActive: '2 hours ago',
    avatarInitials: 'JC',
  },
  {
    id: 'tm-3',
    name: 'Priya Patel',
    email: 'priya@mailflow.io',
    role: 'editor',
    status: 'active',
    lastActive: '1 day ago',
    avatarInitials: 'PP',
  },
  {
    id: 'tm-4',
    name: 'Alex Rivera',
    email: 'alex@mailflow.io',
    role: 'viewer',
    status: 'invited',
    lastActive: 'Never',
    avatarInitials: 'AR',
  },
];

export const mockBillingInfo: BillingInfo = {
  currentPlan: 'pro',
  monthlyPrice: '$99',
  seatsUsed: 3,
  seatsTotal: 5,
  engagementsActive: 6,
  engagementsLimit: 25,
  paymentMethod: 'Visa ending in 4242',
  billingHistory: [
    { id: 'bh-1', date: 'Apr 1, 2026', description: 'Pro Plan — Monthly', amount: '$99.00', status: 'paid' },
    { id: 'bh-2', date: 'Mar 1, 2026', description: 'Pro Plan — Monthly', amount: '$99.00', status: 'paid' },
    { id: 'bh-3', date: 'Feb 1, 2026', description: 'Pro Plan — Monthly', amount: '$99.00', status: 'paid' },
    { id: 'bh-4', date: 'Jan 1, 2026', description: 'Pro Plan — Monthly', amount: '$99.00', status: 'paid' },
    { id: 'bh-5', date: 'Dec 1, 2025', description: 'Pro Plan — Monthly', amount: '$99.00', status: 'paid' },
  ],
};

export const planFeatures = {
  free: {
    name: 'Free',
    price: '$0',
    period: '/mo',
    features: ['1 team seat', '3 active engagements', 'Basic analytics', 'Email support'],
  },
  pro: {
    name: 'Pro',
    price: '$99',
    period: '/mo',
    features: ['5 team seats', '25 active engagements', 'Advanced analytics', 'Priority support', 'Custom branding', 'API access'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: ['Unlimited seats', 'Unlimited engagements', 'Full analytics suite', 'Dedicated CSM', 'SSO & SAML', 'SLA guarantee', 'Custom integrations'],
  },
};
