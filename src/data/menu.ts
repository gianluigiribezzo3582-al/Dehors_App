/**
 * Menù del locale (segnaposto: sostituisci con il menù ufficiale).
 * `tags` facoltativi: 'veg', 'vegan', 'gf' (senza glutine), 'new', 'spicy'.
 */
export type MenuTag = 'veg' | 'vegan' | 'gf' | 'new' | 'spicy';

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  tags?: MenuTag[];
};

export type MenuCategory = {
  id: string;
  title: string;
  icon: string;
  items: MenuItem[];
};

export const Menu: MenuCategory[] = [
  {
    id: 'caffetteria',
    title: 'Caffetteria',
    icon: 'cafe-outline',
    items: [
      { id: 'espresso', name: 'Espresso', price: 1.2 },
      { id: 'macchiato', name: 'Caffè macchiato', price: 1.3 },
      { id: 'cappuccino', name: 'Cappuccino', price: 1.6 },
      { id: 'latte-macchiato', name: 'Latte macchiato', price: 1.8 },
      { id: 'ginseng', name: 'Ginseng', price: 1.6 },
      { id: 'te', name: 'Tè e infusi', description: 'Selezione di tè in foglia', price: 2.5 },
    ],
  },
  {
    id: 'colazione',
    title: 'Colazione',
    icon: 'sunny-outline',
    items: [
      { id: 'cornetto', name: 'Cornetto', description: 'Vuoto, crema, marmellata o cioccolato', price: 1.4, tags: ['veg'] },
      { id: 'cornetto-vegan', name: 'Cornetto vegano', price: 1.6, tags: ['vegan'] },
      { id: 'spremuta', name: 'Spremuta d\'arancia', price: 3.5, tags: ['vegan', 'gf'] },
    ],
  },
  {
    id: 'aperitivo',
    title: 'Aperitivo',
    icon: 'wine-outline',
    items: [
      { id: 'spritz', name: 'Spritz', description: 'Aperol o Campari', price: 6 },
      { id: 'americano', name: 'Americano', price: 7 },
      { id: 'negroni', name: 'Negroni', price: 8 },
      { id: 'analcolico', name: 'Analcolico della casa', price: 5, tags: ['new'] },
      { id: 'tagliere', name: 'Tagliere misto', description: 'Salumi e formaggi locali', price: 12 },
    ],
  },
  {
    id: 'cocktail',
    title: 'Cocktail',
    icon: 'beer-outline',
    items: [
      { id: 'gin-tonic', name: 'Gin tonic', price: 9 },
      { id: 'moscow-mule', name: 'Moscow mule', price: 9 },
      { id: 'mojito', name: 'Mojito', price: 9 },
      { id: 'signature', name: 'Signature Dehors', description: 'Chiedi al bancone il cocktail del mese', price: 10, tags: ['new'] },
    ],
  },
  {
    id: 'bibite',
    title: 'Bibite',
    icon: 'water-outline',
    items: [
      { id: 'acqua', name: 'Acqua', price: 1.5 },
      { id: 'soft', name: 'Soft drink', price: 3 },
      { id: 'birra-spina', name: 'Birra alla spina', description: 'Piccola / media', price: 4 },
    ],
  },
];

