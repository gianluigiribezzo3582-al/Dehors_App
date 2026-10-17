import legal from './legal.json';

export type LegalDoc = {
  title: string;
  updated: string;
  intro: string;
  sections: { h: string; p: string[] }[];
};

export const Legal = {
  privacy: legal.privacy as LegalDoc,
  terms: legal.terms as LegalDoc,
};

export type LegalKey = keyof typeof Legal;

export const DeveloperCredits = legal.credits;
