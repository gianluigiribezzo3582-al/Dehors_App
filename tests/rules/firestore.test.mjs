// Test delle regole di sicurezza Firestore sull'emulatore (serve Java 11+).
//   cd tests/rules && npm install && npm test
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';

const env = await initializeTestEnvironment({
  projectId: 'dehors-test',
  firestore: { rules: readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 8089 },
});
const results = [];
async function t(name, expectOk, fn) {
  try { await (expectOk ? assertSucceeds(fn()) : assertFails(fn())); results.push(`OK   ${name}`); }
  catch (e) { results.push(`FAIL ${name}: ${e.message.split('\n')[0]}`); }
}
const profile = (o = {}) => ({ name: 'Mario', email: 'mario@x.it', phone: null, role: 'customer', points: 10, totalEarned: 10, cardCode: 'ABCDEFGH', redeemed: {}, createdAt: 1, ...o });

await env.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();
  await db.doc('users/staff1').set(profile({ name: 'Staff', email: 'staff@x.it', role: 'staff' }));
  await db.doc('users/cli2').set(profile({ name: 'Luigi', email: 'luigi@x.it', points: 50, redeemed: { caffe: 2 } }));
  await db.doc('users/cli2/transactions/t1').set({ delta: 5, kind: 'earn' });
  await db.doc('events/pub').set({ title: 'Pub', published: true, startsAt: 1 });
  await db.doc('events/draft').set({ title: 'Bozza', published: false, startsAt: 1 });
  await db.doc('content/menu').set({ categories: [] });
});

const guest = env.unauthenticatedContext().firestore();
const cli = env.authenticatedContext('cli1', { email: 'mario@x.it' }).firestore();
const cli2 = env.authenticatedContext('cli2', { email: 'luigi@x.it' }).firestore();
const staff = env.authenticatedContext('staff1', { email: 'staff@x.it' }).firestore();

// Registrazione
await t('cliente crea il proprio profilo', true, () => cli.doc('users/cli1').set(profile()));
await t('cliente NON si crea come staff', false, () => env.authenticatedContext('x1', { email: 'a@x.it' }).firestore().doc('users/x1').set(profile({ email: 'a@x.it', role: 'staff' })));
await t('cliente NON si regala 1000 punti', false, () => env.authenticatedContext('x2', { email: 'b@x.it' }).firestore().doc('users/x2').set(profile({ email: 'b@x.it', points: 1000, totalEarned: 1000 })));
await t('cliente crea movimento di benvenuto', true, () => cli.doc('users/cli1/transactions/welcome').set({ delta: 10, kind: 'welcome', createdAt: 1 }));
// Profilo
await t('cliente cambia il proprio nome', true, () => cli.doc('users/cli1').update({ name: 'Mario R.' }));
await t('cliente NON cambia i propri punti', false, () => cli.doc('users/cli1').update({ points: 999 }));
await t('cliente NON si promuove staff', false, () => cli.doc('users/cli1').update({ role: 'admin' }));
await t('cliente NON azzera i premi già usati', false, () => cli2.doc('users/cli2').update({ redeemed: {} }));
await t('cliente NON legge altri clienti', false, () => cli.doc('users/cli2').get());
await t('cliente NON elenca i clienti', false, () => cli.collection('users').get());
await t('cliente legge i propri movimenti', true, () => cli2.collection('users/cli2/transactions').get());
await t('cliente NON legge movimenti altrui', false, () => cli.collection('users/cli2/transactions').get());
await t('cliente NON si aggiunge movimenti', false, () => cli.collection('users/cli1/transactions').add({ delta: 100, kind: 'earn', staffId: 'cli1' }));
await t('ospite NON legge profili', false, () => guest.doc('users/cli2').get());
// Staff
await t('staff legge un cliente', true, () => staff.doc('users/cli2').get());
await t('staff cerca clienti', true, () => staff.collection('users').where('cardCode', '==', 'ABCDEFGH').get());
await t('staff aggiorna punti e premi', true, () => staff.doc('users/cli2').update({ points: 30, totalEarned: 10, redeemed: { caffe: 3 } }));
await t('staff NON porta il saldo sotto zero', false, () => staff.doc('users/cli2').update({ points: -5 }));
await t('staff NON cambia il ruolo', false, () => staff.doc('users/cli2').update({ role: 'staff' }));
await t('staff registra un movimento', true, () => staff.collection('users/cli2/transactions').add({ delta: 5, kind: 'earn', staffId: 'staff1' }));
await t('staff NON firma movimenti a nome altrui', false, () => staff.collection('users/cli2/transactions').add({ delta: 5, kind: 'earn', staffId: 'altro' }));
// Contenuti
await t('ospite legge il menù', true, () => guest.doc('content/menu').get());
await t('cliente NON modifica il menù', false, () => cli.doc('content/menu').set({ categories: [] }));
await t('ospite NON modifica il menù', false, () => guest.doc('content/menu').set({ categories: [] }));
await t('staff modifica il menù', true, () => staff.doc('content/menu').set({ categories: [{ id: 'a' }] }));
await t('staff modifica premi e testi', true, async () => { await staff.doc('content/rewards').set({ items: [] }); await staff.doc('content/texts').set({ phone: '1' }); });
await t('staff NON crea documenti contenuto arbitrari', false, () => staff.doc('content/altro').set({ x: 1 }));
await t('staff scrive pranzo del giorno', true, () => staff.doc('content/lunch').set({ dishes: [{ id: 'p1', name: 'Orecchiette' }], note: '', from: '10:00', to: '15:00' }));
await t('staff segna un esaurito', true, () => staff.doc('content/availability').set({ soldOut: { p1: true } }, { merge: true }));
await t('ospite legge pranzo ed esauriti', true, async () => { await guest.doc('content/lunch').get(); await guest.doc('content/availability').get(); });
await t('cliente NON segna esauriti', false, () => cli.doc('content/availability').set({ soldOut: { p1: false } }, { merge: true }));
await t('cliente NON modifica il pranzo', false, () => cli.doc('content/lunch').set({ dishes: [] }));
// Eventi
await t('ospite legge evento pubblicato', true, () => guest.doc('events/pub').get());
await t('ospite NON legge bozza', false, () => guest.doc('events/draft').get());
await t('ospite elenca eventi pubblicati', true, () => guest.collection('events').where('published', '==', true).get());
await t('ospite NON elenca tutti gli eventi', false, () => guest.collection('events').get());
await t('cliente NON crea eventi', false, () => cli.collection('events').add({ title: 'x', published: true }));
await t('staff crea ed elimina eventi', true, async () => { await staff.doc('events/e1').set({ title: 'x', published: false, startsAt: 1 }); await staff.doc('events/e1').delete(); });
await t('staff vede le bozze', true, () => staff.collection('events').get());
// Notifiche
await t('ospite registra il proprio token', true, () => guest.doc('pushTokens/ExponentPushToken[abc]').set({ token: 'ExponentPushToken[abc]', uid: null, platform: 'android', updatedAt: 1 }));
await t('cliente collega il token a sé', true, () => cli.doc('pushTokens/ExponentPushToken[abc]').set({ token: 'ExponentPushToken[abc]', uid: 'cli1', platform: 'android', updatedAt: 2 }));
await t('cliente NON collega token a un altro', false, () => cli.doc('pushTokens/ExponentPushToken[zzz]').set({ token: 'ExponentPushToken[zzz]', uid: 'cli2', platform: 'android', updatedAt: 2 }));
await t('ospite NON legge i token', false, () => guest.collection('pushTokens').get());
await t('cliente NON legge i token', false, () => cli.collection('pushTokens').get());
await t('staff legge i token', true, () => staff.collection('pushTokens').get());

console.log(results.join('\n'));
console.log(`\n${results.filter((r) => r.startsWith('OK')).length}/${results.length} superati`);
await env.cleanup();
