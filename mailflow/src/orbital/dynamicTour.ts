import type { TourStep } from './TourEngine';
import { ORBITAL_IDS } from './ids';

export type DynamicTourPlan = {
  introMessage: string;
  steps: TourStep[];
};

function isReengagementQuestion(input: string): boolean {
  const q = input.toLowerCase();
  const hasInactiveIntent =
    q.includes('inactive') ||
    q.includes('cold') ||
    q.includes('unengaged') ||
    q.includes('didn\'t open') ||
    q.includes('didnt open');
  const hasCampaignIntent =
    q.includes('re-engage') ||
    q.includes('reengage') ||
    q.includes('win back') ||
    q.includes('send') ||
    q.includes('campaign');
  return hasInactiveIntent && hasCampaignIntent;
}

function buildReengagementTour(currentRoute: string): DynamicTourPlan {
  const alreadyOnSegments = currentRoute === '/audiences?tab=segments';
  const steps: TourStep[] = [];

  if (!alreadyOnSegments) {
    steps.push({
      id: 'dyn-audiences',
      targetId: ORBITAL_IDS.sidebarAudiences,
      route: '/audiences?tab=segments',
      message: 'First, open **Audiences** so we can work from your Segments list.',
      ctaLabel: 'Open Audiences',
      waitForEvent: 'route:/audiences?tab=segments',
      advanceDelayMs: 180,
    });
  }

  steps.push(
    {
      id: 'dyn-new-segment',
      targetId: ORBITAL_IDS.audiencesNewSegmentBtn,
      route: '/audiences?tab=segments',
      message:
        'Click **New segment** and create an "Inactive" segment (for contacts who have not opened recently).',
      waitForEvent: 'segment:modal-open',
      advanceDelayMs: 120,
    },
    {
      id: 'dyn-fill-segment',
      targetId: ORBITAL_IDS.audiencesSegmentModal,
      route: '/audiences?tab=segments',
      message:
        'Fill out the segment form, then click **Create segment** to save your inactive audience.',
      waitForEvent: 'segment:created',
      advanceDelayMs: 120,
    },
    {
      id: 'dyn-go-campaigns',
      targetId: ORBITAL_IDS.sidebarCampaigns,
      message: 'Now go to **Campaigns** so we can send a re-engagement email to that segment.',
      ctaLabel: 'Go to Campaigns',
      waitForEvent: 'route:/campaigns',
    },
    {
      id: 'dyn-create-campaign',
      targetId: ORBITAL_IDS.campaignsListCreateBtn,
      route: '/campaigns',
      message: 'Click **Create campaign** to start a new re-engagement send.',
      waitForEvent: 'route:prefix:/campaigns/new',
      advanceDelayMs: 180,
    },
    {
      id: 'dyn-pick-audience',
      targetId: ORBITAL_IDS.wizardAudienceSelect,
      route: '/campaigns/new?step=2',
      message:
        'Choose your inactive segment as the audience, then continue through content and review.',
    },
    {
      id: 'dyn-send',
      targetId: ORBITAL_IDS.wizardSendBtn,
      route: '/campaigns/new?step=4',
      message: 'Great — when ready, click **Send campaign** to launch your re-engagement message.',
      ctaLabel: 'Send campaign',
      waitForEvent: 'campaign:sent',
    }
  );

  return {
    introMessage:
      "I can guide this live. I generated a quick tour to help you create an inactive segment and send a re-engagement campaign.",
    steps,
  };
}

export function buildTourFromQuestion(input: string): DynamicTourPlan | null {
  const currentRoute = ((window as any).__mailflow?.route as string | undefined) ?? '';
  if (isReengagementQuestion(input)) {
    return buildReengagementTour(currentRoute);
  }
  return null;
}
