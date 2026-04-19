import { useStore } from '../store';

type EventType =
  | 'campaign:created'
  | 'campaign:sent'
  | 'contacts:imported'
  | 'teammate:invited'
  | 'checkout:started'
  | 'checkout:abandoned'
  | 'ab:started'
  | 'route:changed';

type EventCallback = (payload?: unknown) => void;

const listeners = new Map<EventType, Set<EventCallback>>();

export function emitOrbitalEvent(type: EventType, payload?: unknown) {
  const bridge = (window as any).__mailflow;
  if (bridge) {
    bridge.lastEvent = { type, at: Date.now(), payload };
  }
  listeners.get(type)?.forEach((cb) => cb(payload));
}

function on(event: EventType, cb: EventCallback) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event)!.add(cb);
  return () => listeners.get(event)?.delete(cb);
}

export function syncBridge(route: string) {
  const state = useStore.getState();
  const campaignsWithVariants = state.campaigns.filter(
    (c) => c.variants && c.variants.length > 0 && c.status !== 'sent'
  );

  (window as any).__mailflow = {
    user: {
      id: state.currentUser.id,
      plan: state.plan,
      role: state.currentUser.role,
    },
    flags: {
      CONTACTS_UPLOADED: state.contactsUploaded,
      CAMPAIGN_CREATED: state.campaigns.some(
        (c) => c.status === 'sent' || c.status === 'scheduled'
      ),
      active_tests: campaignsWithVariants.length,
      checkout_initiated: state.checkoutInitiated,
      teammate_count_delta: state.teammateCountDelta,
    },
    route,
    lastEvent: (window as any).__mailflow?.lastEvent,
    on,
  };
}
