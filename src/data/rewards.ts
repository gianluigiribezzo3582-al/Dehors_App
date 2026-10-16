import type { ImageSourcePropType } from 'react-native';

/**
 * Premi del programma fedeltà.
 * Per aggiungere una foto/sfondo: salva l'immagine in assets/images/rewards/
 * e imposta `image: require('@/assets/images/rewards/nome-file.jpg')`.
 * Senza immagine la card usa il colore `tint`.
 */
export type Reward = {
  id: string;
  title: string;
  description: string;
  cost: number;
  image?: ImageSourcePropType;
  tint: string;
  icon: string;
};

export const Rewards: Reward[] = [
  {
    id: 'caffe',
    title: 'Caffè omaggio',
    description: 'Un espresso o un caffè macchiato offerto dalla casa.',
    cost: 20,
    tint: '#4A3222',
    icon: 'cafe',
  },
  {
    id: 'colazione',
    title: 'Colazione completa',
    description: 'Cappuccino e cornetto a scelta.',
    cost: 50,
    tint: '#6B4A2E',
    icon: 'sunny',
  },
  {
    id: 'sconto-10',
    title: 'Sconto 10%',
    description: 'Il 10% di sconto sul conto del tavolo.',
    cost: 80,
    tint: '#2C4A36',
    icon: 'pricetag',
  },
  {
    id: 'aperitivo',
    title: 'Aperitivo offerto',
    description: 'Uno spritz o un analcolico con stuzzichini.',
    cost: 120,
    tint: '#1F3D2B',
    icon: 'wine',
  },
  {
    id: 'cocktail',
    title: 'Cocktail signature',
    description: 'Il cocktail del mese preparato dal nostro barman.',
    cost: 180,
    tint: '#14271C',
    icon: 'beer',
  },
];

export function rewardById(id: string | undefined): Reward | undefined {
  return Rewards.find((r) => r.id === id);
}
