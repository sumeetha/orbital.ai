import { CreditCard, Check, ArrowUpRight } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Card, Badge, Button } from '../../components/ui';
import { useStore } from '../../store';
import { planFeatures } from '../../mock/settings';

export function BillingPage() {
  const { billingInfo } = useStore();

  return (
    <div>
      <PageHeader title="Billing" subtitle="Manage your subscription and payment details" />

      {/* Current Plan */}
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-orbital-text-dark">Pro Plan</h3>
              <Badge color="green">Active</Badge>
            </div>
            <p className="text-sm text-orbital-text-muted">
              {billingInfo.monthlyPrice}/month &middot; {billingInfo.seatsUsed}/{billingInfo.seatsTotal} seats used &middot; {billingInfo.engagementsActive}/{billingInfo.engagementsLimit} engagements active
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">Change Plan</Button>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-orbital-text-muted">
          <CreditCard size={16} />
          <span>{billingInfo.paymentMethod}</span>
          <button className="text-orbital-primary hover:underline ml-2 text-xs">Update</button>
        </div>
      </Card>

      {/* Plan Comparison */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {(Object.entries(planFeatures) as [string, typeof planFeatures.free][]).map(([key, plan]) => {
          const isCurrent = key === billingInfo.currentPlan;
          return (
            <Card
              key={key}
              className={`p-6 ${isCurrent ? 'ring-2 ring-orbital-primary' : ''}`}
            >
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-semibold text-orbital-text-dark">{plan.name}</h4>
                  {isCurrent && <Badge color="violet">Current</Badge>}
                </div>
                <div className="mt-1">
                  <span className="text-2xl font-bold text-orbital-text-dark">{plan.price}</span>
                  <span className="text-sm text-orbital-text-muted">{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span className="text-orbital-text-dark">{feature}</span>
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <Button variant="secondary" size="sm" className="w-full" disabled>Current Plan</Button>
              ) : key === 'enterprise' ? (
                <Button variant="secondary" size="sm" className="w-full">
                  Contact Sales <ArrowUpRight size={14} />
                </Button>
              ) : (
                <Button variant={key === 'pro' ? 'primary' : 'secondary'} size="sm" className="w-full">
                  {key === 'free' ? 'Downgrade' : 'Upgrade'}
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      {/* Billing History */}
      <h3 className="text-lg font-semibold text-orbital-text-dark mb-3">Billing History</h3>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-orbital-border-light text-left text-orbital-text-muted">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium text-right">Amount</th>
                <th className="px-4 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {billingInfo.billingHistory.map((entry) => (
                <tr key={entry.id} className="border-b border-orbital-border-light last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-orbital-text-muted">{entry.date}</td>
                  <td className="px-4 py-3 text-orbital-text-dark">{entry.description}</td>
                  <td className="px-4 py-3 text-right font-medium text-orbital-text-dark">{entry.amount}</td>
                  <td className="px-4 py-3 text-right">
                    <Badge color={entry.status === 'paid' ? 'green' : entry.status === 'pending' ? 'amber' : 'red'}>
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
