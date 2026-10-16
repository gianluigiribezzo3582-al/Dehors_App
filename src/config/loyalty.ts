/** Regole del programma fedeltà. */
export const Loyalty = {
  /** Punti assegnati per ogni euro speso (arrotondati per difetto). */
  pointsPerEuro: 1,
  /** Punti regalati a chi si registra. */
  welcomeBonus: 10,
  /** Pulsanti rapidi nella schermata staff per aggiungere/togliere punti. */
  quickAdjustments: [1, 5, 10, 25],
  /** Livelli in base ai punti totali guadagnati da sempre. */
  tiers: [
    { name: 'Bronze', minTotal: 0, color: '#A0703C' },
    { name: 'Silver', minTotal: 250, color: '#9CA3A0' },
    { name: 'Gold', minTotal: 750, color: '#C9A227' },
  ],
};

export type Tier = (typeof Loyalty.tiers)[number];

export function tierFor(totalEarned: number): { current: Tier; next: Tier | null } {
  const tiers = Loyalty.tiers;
  let index = 0;
  tiers.forEach((t, i) => {
    if (totalEarned >= t.minTotal) index = i;
  });
  return { current: tiers[index], next: tiers[index + 1] ?? null };
}

export function pointsForAmount(euro: number): number {
  if (!Number.isFinite(euro) || euro <= 0) return 0;
  return Math.floor(euro * Loyalty.pointsPerEuro);
}
