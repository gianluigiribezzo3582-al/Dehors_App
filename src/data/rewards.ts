/**
 * Premi iniziali del programma fedeltà.
 * Dopo il primo salvataggio dalla gestione staff nell'app, fanno fede i premi salvati online.
 */
export type Reward = {
  id: string;
  title: string;
  description: string;
  cost: number;
  tint: string;
  icon: string;
};

export const Rewards: Reward[] = [
  {
    id: 'caffe',
    title: 'Caffè omaggio',
    description: 'Un espresso, anche macchiato o dek, offerto dalla casa.',
    cost: 20,
    tint: '#4A3222',
    icon: 'cafe',
  },
  {
    id: 'colazione',
    title: 'Colazione',
    description: 'Cappuccino e croissant a scelta.',
    cost: 50,
    tint: '#6B4A2E',
    icon: 'sunny',
  },
  {
    id: 'sconto-10',
    title: 'Sconto 10%',
    description: 'Il 10% di sconto sul conto del tavolo.',
    cost: 80,
    tint: '#2A3B31',
    icon: 'pricetag',
  },
  {
    id: 'aperitivo',
    title: 'Aperol spritz offerto',
    description: 'Uno spritz con tris classico per l\'aperitivo.',
    cost: 120,
    tint: '#3B4F42',
    icon: 'wine',
  },
  {
    id: 'pinsa',
    title: 'Pinsa a scelta',
    description: 'Una pinsa del menù, anche quella della settimana.',
    cost: 180,
    tint: '#1C2822',
    icon: 'pizza',
  },
];
