/**
 * Menù di Dehors Cafè-Bistrot (da «Menu ottobre 2026»).
 *
 * - `price` in euro; per prezzi non singoli («da € 3,50 a € 6,00», «+ € 0,50») usa `priceLabel`.
 * - `frozen: true` aggiunge l'asterisco (prodotto surgelato/congelato all'origine).
 * - `tags` facoltativi: 'vegan', 'gf' (senza glutine), 'week' (proposta della settimana).
 */
export type MenuTag = 'vegan' | 'gf' | 'week';

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price?: number;
  priceLabel?: string;
  frozen?: boolean;
  tags?: MenuTag[];
};

export type MenuCategory = {
  id: string;
  title: string;
  icon: string;
  /** Riga in fondo alla sezione (servizio, coperto, supplementi). */
  note?: string;
  items: MenuItem[];
};

const SERVIZIO = 'Servizio al tavolo € 0,50';
const COPERTO = 'Coperto € 1,00';

export const Menu: MenuCategory[] = [
  {
    id: 'caffetteria',
    title: 'Caffetteria',
    icon: 'cafe-outline',
    note: SERVIZIO,
    items: [
      { id: 'espresso', name: 'Espresso', price: 1.1 },
      { id: 'espresso-soia', name: 'Espresso soia/accadì', price: 1.3 },
      { id: 'espresso-macchiato', name: 'Espresso macchiato', price: 1.2 },
      { id: 'espresso-doppio', name: 'Espresso doppio', price: 1.7 },
      { id: 'espresso-dek', name: 'Espresso dek', price: 1.2 },
      { id: 'espresso-americano', name: 'Espresso americano', price: 1.7 },
      { id: 'espresso-corretto', name: 'Espresso corretto', price: 1.7 },
      { id: 'espresso-viennese', name: 'Espresso viennese', price: 1.7 },
      { id: 'espresso-freddo', name: 'Espresso freddo', price: 1.4 },
      { id: 'espresso-ghiaccio', name: 'Espresso al ghiaccio', price: 1.6 },
      { id: 'espresso-dek-ghiaccio', name: 'Espresso dek in ghiaccio', price: 1.7 },
      { id: 'orzo', name: 'Orzo', price: 1.5 },
      { id: 'ginseng', name: 'Ginseng', price: 1.7 },
      { id: 'espressino', name: 'Espressino / Espressino dek', price: 1.4 },
      { id: 'espressino-soia', name: 'Espressino soia/accadì', price: 1.5 },
      { id: 'espressino-nutella', name: 'Espressino alla nutella', price: 1.6 },
      { id: 'espressino-ginseng', name: 'Espressino ginseng/orzo', price: 1.8 },
      { id: 'espressino-freddo', name: 'Espressino freddo', price: 1.7 },
      { id: 'espressino-freddo-piccolo', name: 'Espressino freddo piccolo', price: 3 },
      { id: 'espressino-freddo-panna', name: 'Espressino freddo con panna', price: 3.5 },
      { id: 'cappuccino', name: 'Cappuccino', price: 1.6 },
      { id: 'cappuccino-dek', name: 'Cappuccino dek', price: 1.7 },
      { id: 'cappuccino-soia', name: 'Cappuccino soia/accadì', price: 1.8 },
      { id: 'cappuccino-orzo', name: 'Cappuccino orzo/ginseng', price: 2.1 },
      { id: 'cappuccino-viennese', name: 'Cappuccino viennese', price: 2.1 },
      { id: 'cappuccino-nutella', name: 'Cappuccino alla nutella', price: 2.1 },
      { id: 'latte-bianco', name: 'Latte bianco', price: 1.3 },
      { id: 'latte-macchiato', name: 'Latte macchiato', price: 2 },
      { id: 'espresso-salentino', name: 'Espresso salentino', description: 'Ghiaccio, latte di mandorla, lime, noce moscata', price: 2.6 },
      { id: 'espresso-leccese', name: 'Espresso leccese', description: 'Ghiaccio, latte di mandorla', price: 2.1 },
      { id: 'espresso-shakerato', name: 'Espresso shakerato', price: 3.1 },
      { id: 'espresso-dehors', name: 'Espresso Dehors', description: 'Ghiaccio, latte di mandorla, sambuca', price: 3.5 },
      { id: 'shakerato-baileys', name: 'Espresso shakerato al Baileys', price: 3.6 },
      { id: 'irish-coffee', name: 'Irish coffee', price: 6 },
    ],
  },
  {
    id: 'pasticceria',
    title: 'Croissant & pasticceria',
    icon: 'sunny-outline',
    note: `${SERVIZIO} · *Alcuni prodotti potrebbero essere surgelati/congelati`,
    items: [
      { id: 'croissant-vuoto', name: 'Croissant vuoto', price: 1.3, frozen: true },
      { id: 'croissant-farcito', name: 'Croissant farcito', price: 1.5, frozen: true },
      { id: 'sfoglie', name: 'Sfoglie', price: 1.5, frozen: true },
      { id: 'pasticciotto-mini', name: 'Pasticciotto leccese mini', price: 1.6, frozen: true },
      { id: 'pasticciotto', name: 'Pasticciotto leccese', price: 2, frozen: true },
      { id: 'muffin-cioccolato', name: 'Muffin cioccolato', price: 3, frozen: true },
      { id: 'muffin-gf', name: 'Muffin gluten free', description: 'Cioccolato, vaniglia', price: 4, frozen: true, tags: ['gf'] },
      { id: 'frollini', name: 'Frollini (al pezzo)', price: 1 },
      { id: 'piccola-pasticceria', name: 'Piccola pasticceria', price: 1.6 },
      { id: 'tortina-carota', name: 'Tortina carota', price: 3, frozen: true },
      { id: 'souffle-cioccolato', name: 'Soufflé cioccolato', price: 4.5, frozen: true },
      { id: 'souffle-pistacchio', name: 'Soufflé pistacchio', price: 4.5, frozen: true },
      { id: 'souffle-panna', name: 'Soufflé con panna', priceLabel: '+ € 0,50', frozen: true },
    ],
  },
  {
    id: 'frutta',
    title: 'Frutta, bowl & frullati',
    icon: 'nutrition-outline',
    note: SERVIZIO,
    items: [
      { id: 'yogurt-bowl', name: 'Yogurt bowl', description: 'Tre ingredienti a scelta: frutta fresca, frutta secca, semi, muesli', price: 5 },
      { id: 'estratti', name: 'Estratti', description: 'Tre ingredienti a scelta tra frutta e verdura', price: 5 },
      { id: 'milkshake', name: 'Milkshake - Smoothies', description: 'Tre ingredienti a scelta', price: 5 },
      { id: 'macedonia', name: 'Macedonia', price: 5 },
      { id: 'spremuta', name: 'Spremuta di arancia', price: 4 },
      { id: 'frullati', name: 'Frullati', description: 'Due ingredienti a scelta', price: 4 },
      { id: 'frullati-soia', name: 'Frullati con latte di soia/accadì', priceLabel: '+ € 0,50' },
    ],
  },
  {
    id: 'soft-drink',
    title: 'Soft drink',
    icon: 'water-outline',
    note: SERVIZIO,
    items: [
      { id: 'acqua-05', name: 'Acqua 0,50 l', price: 1 },
      { id: 'acqua-1', name: 'Acqua 1 l', price: 2 },
      {
        id: 'soft-drink',
        name: 'Soft drink',
        description: 'Coca Cola, Fanta, San Pellegrino, Estathé limone o pesca, Lemon soda, tonica, ginger beer, cedrata, chinotto',
        price: 3,
      },
      { id: 'succhi', name: 'Succhi di frutta', price: 2.5 },
      { id: 'succo-melograno', name: 'Succo di frutta melograno', price: 3 },
      { id: 'succo-mirtillo', name: 'Succo di frutta mirtillo', price: 3 },
      { id: 'sanbitter', name: 'Sanbitter', price: 2.5 },
      { id: 'crodino', name: 'Crodino', price: 2.5 },
      { id: 'red-bull', name: 'Red Bull', price: 3.5 },
      { id: 'campari-soda', name: 'Campari Soda', price: 3.5 },
    ],
  },
  {
    id: 'aperitivo',
    title: 'Aperitivo',
    icon: 'wine-outline',
    note: COPERTO,
    items: [
      { id: 'tris', name: 'Tris classico', price: 4 },
      { id: 'olive-mandorle', name: 'Olive e/o mandorle tostate', price: 3 },
      { id: 'ciotolina', name: 'Ciotolina singola', price: 2.5 },
      { id: 'tortillas', name: 'Tortillas con salsa', price: 4 },
      { id: 'aperitivo-dehors', name: 'Aperitivo Dehors (6 pz)', price: 11 },
      { id: 'aperitivo-gf', name: 'Aperitivo gluten free (6 pz)', price: 13, tags: ['gf'] },
      { id: 'carpaccio-bresaola', name: 'Carpaccio di bresaola', description: 'Bresaola, limone, noci, rucola, grana', price: 8 },
      { id: 'carpaccio-salmone', name: 'Carpaccio di salmone', description: 'Salmone affumicato, arancia, rucola', price: 10 },
      {
        id: 'avocado-toast',
        name: 'Avocado toast (tre pezzi)',
        description:
          '1. Avocado, salmone, semi di sesamo, limone · 2. Avocado, uovo, semi di papavero · 3. Avocado, feta, olive, cetrioli',
        price: 13,
      },
      { id: 'avocado-toast-singolo', name: 'Avocado toast (singolo pezzo)', price: 5 },
    ],
  },
  {
    id: 'pucce',
    title: 'Pucce & maxi toast',
    icon: 'fast-food-outline',
    note: COPERTO,
    items: [
      { id: 'puccia-cotto', name: 'Cotto', description: 'Cotto, formaggio, insalata', price: 5.5 },
      { id: 'puccia-mortadella', name: 'Mortadella', description: 'Mortadella, stracciatella, granella di pistacchio, insalata', price: 6 },
      { id: 'puccia-vegan', name: 'Vegan', description: 'Guacamole, verdure grigliate, insalata', price: 5.5, tags: ['vegan'] },
      { id: 'puccia-crudo', name: 'Crudo', description: 'Prosciutto crudo, stracciatella, pomodoro, insalata', price: 7 },
      { id: 'puccia-bresaola', name: 'Bresaola', description: 'Bresaola, cream cheese, rucola, grana, pomodori, insalata', price: 7 },
      { id: 'puccia-salmone', name: 'Salmone', description: 'Salmone affumicato, guacamole, stracciatella, insalata', price: 8 },
    ],
  },
  {
    id: 'insalate',
    title: 'Insalate',
    icon: 'leaf-outline',
    note: `Servite con crostini di pane · ${COPERTO}`,
    items: [
      { id: 'insalata-greca', name: 'Greca', description: 'Insalata, feta, olive, cetrioli, pomodori, cipolla crispy, salsa allo yogurt', price: 7 },
      { id: 'insalata-vegetable', name: 'Vegetable', description: 'Insalata, verdure grigliate, mozzarella, crumble di taralli', price: 7 },
      { id: 'insalata-dehors', name: 'Dehors', description: 'Insalata, pomodori, tonno, cipolla, uova sode, mais', price: 8 },
      { id: 'insalata-pollo', name: 'Pollo', description: 'Insalata, pollo, grana, salsa caesar, pomodori, cipolla crispy', price: 9 },
      { id: 'insalata-bresaola', name: 'Bresaola', description: 'Insalata, bresaola, noci, pomodori, mozzarella, grana, rucola', price: 9 },
      { id: 'insalata-salmone', name: 'Salmone', description: 'Insalata, salmone affumicato, pomodori, avocado, sesamo', price: 10 },
    ],
  },
  {
    id: 'pinse',
    title: 'Pinse & Ciccio',
    icon: 'pizza-outline',
    note: `Mozzarella senza lattosio + € 1,00 · Aggiunta ingredienti + € 1,00 · *Prodotto surgelato all'origine · ${COPERTO}`,
    items: [
      { id: 'pinsa-margherita', name: 'Pinsa Margherita', description: 'Base rossa, mozzarella in cottura, basilico', price: 8, frozen: true },
      { id: 'pinsa-vegana', name: 'Pinsa Vegana', description: 'Base bianca, purè di verdure, mix di verdure, semi misti', price: 8, frozen: true, tags: ['vegan'] },
      { id: 'pinsa-mortadella', name: 'Pinsa Mortadella', description: 'Base bianca, mozzarella in cottura, mortadella, stracciatella, granella di pistacchio', price: 10, frozen: true },
      { id: 'pinsa-zucchine', name: 'Pinsa Zucchine', description: 'Base bianca, mozzarella in cottura, zucchine, bacon, philadelphia', price: 11, frozen: true },
      { id: 'pinsa-crudo', name: 'Pinsa Crudo', description: 'Base bianca, mozzarella in cottura, prosciutto crudo, stracciatella, pomodori, rucola', price: 12, frozen: true },
      { id: 'pinsa-bresaola', name: 'Pinsa Bresaola', description: 'Base bianca, mozzarella in cottura, bresaola, pomodori, rucola, grana in scaglie', price: 12, frozen: true },
      { id: 'pinsa-capocollo', name: 'Pinsa Capocollo', description: 'Base rossa, capocollo, mozzarella in cottura, pomodori, noci', price: 12, frozen: true },
      { id: 'pinsa-settimana', name: 'Pinsa della settimana', description: 'Il personale ve ne proporrà una diversa ogni settimana', priceLabel: 'Chiedi al banco', tags: ['week'] },
      { id: 'ciccio-caprese', name: 'Ciccio Caprese', description: 'Base bianca, pomodori, mozzarella, origano', price: 8, frozen: true },
      { id: 'ciccio-barese', name: 'Ciccio Barese', description: 'Base bianca, prosciutto crudo, rucola, pomodori, grana in scaglie', price: 8, frozen: true },
    ],
  },
  {
    id: 'vini-birre',
    title: 'Vini & birre',
    icon: 'beer-outline',
    note: SERVIZIO,
    items: [
      { id: 'calice-bianco', name: 'Calice vino bianco', price: 5 },
      { id: 'calice-rose', name: 'Calice vino rosè', price: 5 },
      { id: 'calice-rosso', name: 'Calice vino rosso', price: 5 },
      { id: 'calice-prosecco', name: 'Calice prosecco', price: 5 },
      { id: 'ichnusa', name: 'Ichnusa non filtrata', price: 3 },
      { id: 'heineken', name: 'Heineken 33 cl', price: 3 },
      { id: 'heineken-0', name: 'Heineken alcohol free 33 cl', price: 3 },
      { id: 'corona', name: 'Corona', price: 3.5 },
      { id: 'tennents', name: "Tennent's", price: 4 },
      { id: 'menabrea', name: 'Menabrea rossa 33 cl', price: 4 },
      { id: 'brewdog', name: 'Brewdog Punk IPA', price: 5 },
      { id: 'birra-gf', name: 'Birra gluten free', price: 5, tags: ['gf'] },
    ],
  },
  {
    id: 'distillati',
    title: 'Distillati',
    icon: 'flask-outline',
    note: SERVIZIO,
    items: [
      { id: 'rum', name: 'Rum', priceLabel: 'da € 3,50 a € 6,00' },
      { id: 'grappe', name: 'Grappe', priceLabel: 'da € 4,50 a € 6,00' },
      { id: 'amari', name: 'Amari', priceLabel: 'da € 3,00 a € 6,00' },
      { id: 'whiskey', name: 'Whiskey', priceLabel: 'da € 3,50 a € 6,00' },
      { id: 'gin', name: 'Gin', priceLabel: 'da € 6,00 a € 9,00' },
    ],
  },
  {
    id: 'cocktail',
    title: 'Cocktail',
    icon: 'wine-outline',
    note: SERVIZIO,
    items: [
      { id: 'aperol-spritz', name: 'Aperol spritz', description: "Aperol, prosecco, seltz, fetta d'arancia", price: 6 },
      { id: 'spritz-mare', name: 'Spritz mare', description: 'Curaçao, prosecco, seltz, rametto di rosmarino', price: 6 },
      { id: 'select-spritz', name: 'Select spritz', description: "Select, prosecco, seltz, fetta d'arancia", price: 7 },
      { id: 'campari-spritz', name: 'Campari spritz', description: "Campari, prosecco, seltz, fetta d'arancia", price: 7 },
      { id: 'americano', name: 'Americano', description: "Vermouth rosso, bitter Campari, seltz, fetta d'arancia", price: 7 },
      { id: 'milano-torino', name: 'Milano - Torino', description: "Vermouth rosso, bitter Campari, fetta d'arancia", price: 7 },
      { id: 'margarita', name: 'Margarita', description: 'Tequila, triple sec, succo di lime, sale', price: 7 },
      { id: 'cosmopolitan', name: 'Cosmopolitan', description: 'Vodka, cranberry, triple sec, succo di lime', price: 7 },
      { id: 'cuba-libre', name: 'Cuba libre', description: 'Rum scuro, succo di lime, coca cola', price: 7 },
      { id: 'hugo', name: 'Hugo', description: 'Sciroppo di fiori di sambuco, prosecco, seltz, menta', price: 7 },
      { id: 'martini-dry', name: 'Martini dry', description: 'Gin, vermouth dry, scorza di limone', price: 7 },
      { id: 'sex-on-the-beach', name: 'Sex on the beach', description: "Vodka alla pesca, succo d'arancia, cranberry", price: 7 },
      { id: 'caipiroska', name: 'Caipiroska', description: 'Vodka, lime, zucchero di canna', price: 7 },
      { id: 'mojito', name: 'Mojito', description: 'Rum bianco, seltz, menta, zucchero di canna, succo di lime', price: 7 },
      { id: 'whiskey-sour', name: 'Whiskey sour', description: 'Bourbon whiskey, succo di limone, sciroppo di zucchero', price: 7 },
      { id: 'negroni', name: 'Negroni', description: "Vermouth rosso, bitter Campari, gin, fetta d'arancia", price: 8 },
      { id: 'negroni-sbagliato', name: 'Negroni sbagliato', description: "Vermouth rosso, bitter Campari, prosecco, fetta d'arancia", price: 8 },
      { id: 'moscow-mule', name: 'Moscow mule', description: 'Vodka, succo e fetta di lime, zenzero, ginger beer', price: 8 },
      { id: 'london-mule', name: 'London mule', description: 'Gin, succo e fetta di lime, ginger beer', price: 8 },
      { id: 'gin-tonic', name: 'Gin tonic', description: 'Gin, tonica', price: 8 },
      { id: 'japanese-ice-tea', name: 'Japanese ice tea', description: 'Vodka, gin, triple sec, rum bianco, Midori, lemon soda, zucchero liquido, sour', price: 8 },
      { id: 'long-island', name: 'Long Island iced tea', description: 'Vodka, gin, triple sec, rum bianco, zucchero liquido, sour, coca cola', price: 8 },
    ],
  },
];

/** Avviso allergeni riportato dal menù cartaceo. */
export const AllergenNotice =
  'In caso di allergie e/o intolleranze, si prega di comunicarlo anticipatamente al personale. In ogni caso è consultabile la tabella degli allergeni.';

/** I 14 allergeni della tabella del menù. */
export const Allergens = [
  'Glutine', 'Crostacei', 'Uova e derivati', 'Pesce', 'Arachidi e derivati', 'Soia', 'Latte e derivati',
  'Frutta a guscio', 'Sedano', 'Senape', 'Sesamo', 'Anidride solforosa e solfiti', 'Lupini', 'Molluschi',
];
