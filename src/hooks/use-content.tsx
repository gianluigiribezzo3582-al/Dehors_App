import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { DefaultContent, withTextDefaults } from '@/content/defaults';
import type { ContentMap, EventItem, RewardDef, SiteTexts } from '@/content/types';
import type { MenuCategory } from '@/data/menu';
import { backend } from '@/services/backend';

const CACHE_KEY = 'dehors-content-cache-v1';

type ContentState = {
  /** Menù completo, comprese le voci nascoste (per la gestione staff). */
  menu: MenuCategory[];
  /** Tutti i premi, compresi quelli disattivati (per la gestione staff). */
  rewards: RewardDef[];
  texts: SiteTexts;
  /** Eventi pubblicati, dal più vicino. */
  events: EventItem[];
};

const ContentContext = createContext<ContentState>({
  menu: DefaultContent.menu.categories,
  rewards: DefaultContent.rewards.items,
  texts: DefaultContent.texts,
  events: [],
});

/**
 * Contenuti modificabili dallo staff (menù, premi, testi, eventi).
 * Mostra subito l'ultima versione salvata sul telefono, poi si aggiorna in tempo reale dal database.
 */
export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Partial<ContentMap>>({});
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(CACHE_KEY)
      .then((raw) => {
        if (!raw || !active) return;
        const cached = JSON.parse(raw) as Partial<ContentMap>;
        // I dati in tempo reale arrivati nel frattempo hanno la precedenza sulla cache.
        setContent((current) => ({ ...cached, ...current }));
      })
      .catch(() => {});

    const keys = ['menu', 'rewards', 'texts'] as const;
    const unsubs = keys.map((key) =>
      backend.subscribeContent(key, (data) => {
        if (!data) return;
        setContent((current) => {
          const next = { ...current, [key]: data };
          AsyncStorage.setItem(CACHE_KEY, JSON.stringify(next)).catch(() => {});
          return next;
        });
      }),
    );
    const unsubEvents = backend.subscribeEvents(false, setEvents);
    return () => {
      active = false;
      unsubs.forEach((u) => u());
      unsubEvents();
    };
  }, []);

  const value = useMemo<ContentState>(
    () => ({
      menu: content.menu?.categories ?? DefaultContent.menu.categories,
      rewards: content.rewards?.items ?? DefaultContent.rewards.items,
      texts: withTextDefaults(content.texts),
      events,
    }),
    [content, events],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  return useContext(ContentContext);
}

/** Premi visibili ai clienti, dal meno costoso. */
export function useActiveRewards() {
  const { rewards } = useContent();
  return useMemo(() => rewards.filter((r) => r.active).sort((a, b) => a.cost - b.cost), [rewards]);
}

/** Eventi pubblicati da oggi in poi. */
export function useUpcomingEvents() {
  const { events } = useContent();
  return useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events.filter((e) => e.startsAt >= today.getTime());
  }, [events]);
}

/** Stato di un premio per un cliente. */
export function rewardStatus(reward: RewardDef, profile: { points: number; redeemed: Record<string, number> } | null) {
  const used = profile ? (profile.redeemed[reward.id] ?? 0) : 0;
  const alreadyUsed = !reward.repeatable && used > 0;
  const enoughPoints = profile !== null && profile.points >= reward.cost;
  return {
    used,
    alreadyUsed,
    available: enoughPoints && !alreadyUsed,
    missing: profile ? Math.max(0, reward.cost - profile.points) : reward.cost,
  };
}
