export type ButtonStyle = 'filled' | 'outlined' | 'rounded-pill';

export type BrandSettings = {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  borderRadius: number;
  logoUrl: string | null;
  buttonStyle: ButtonStyle;
  /** How in-product copy should sound (e.g. formal vs casual, inclusive language). */
  toneOfVoice: string;
};

export const defaultBrandSettings: BrandSettings = {
  primaryColor: '#7c5cfc',
  secondaryColor: '#3b82f6',
  fontFamily: 'Inter',
  borderRadius: 8,
  logoUrl: null,
  buttonStyle: 'filled',
  toneOfVoice: '',
};

export const fontOptions = [
  { value: 'Inter', label: 'Inter' },
  { value: 'system-ui', label: 'System Default' },
  { value: 'Roboto', label: 'Roboto' },
  { value: '"Open Sans"', label: 'Open Sans' },
  { value: '"DM Sans"', label: 'DM Sans' },
];

export const autoDetectedBrand: Partial<BrandSettings> = {
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  fontFamily: '"DM Sans"',
  borderRadius: 12,
  buttonStyle: 'rounded-pill',
  toneOfVoice: 'Clear, encouraging, and concise — expert without jargon.',
};
