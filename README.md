# Dehors – app del locale

App Android/iOS (Expo + React Native) per il bar **Dehors**:

- **Registrazione / login** dei clienti, ciascuno con la propria **tessera digitale con QR** e codice tessera.
- **Menù** consultabile in app, con ricerca, categorie e indicazioni (vegano, senza glutine, novità…).
- **Tessera punti**: saldo, livello (Bronze/Silver/Gold), storico movimenti in tempo reale.
- **Premi**: card con foto/sfondo, barra di avanzamento e premi sbloccati.
- **Area staff** (visibile solo agli account staff): si inquadra il QR del cliente (o si digita il codice tessera, o si cerca per email) e si
  - aggiungono punti in base all'importo speso (1 pt per €, configurabile),
  - riscatta un premio (scala i punti),
  - corregge il saldo a mano con nota.
- **Info & contatti**: chiama il locale con un tocco, WhatsApp, Instagram, email, indicazioni stradali, orari con stato «Aperto ora».
- Tema chiaro (sfondo bianco) e scuro (sfondo nero) automatico, colori verde scuro / marrone.

## Provare subito su Android

1. Installa **Expo Go** dal Play Store sul telefono (deve supportare Expo SDK 58).
2. Sul computer:
   ```bash
   npm install
   npx expo start
   ```
3. Inquadra con Expo Go il QR che appare nel terminale.

Finché Firebase non è configurato l'app gira in **modalità demo**: i dati restano solo sul telefono.
Account di prova già presenti:

| Ruolo   | Email                 | Password     |
|---------|-----------------------|--------------|
| Staff   | staff@dehors.demo     | staff123     |
| Cliente | cliente@dehors.demo   | cliente123   |

In demo puoi provare lo staff cercando il cliente con il codice tessera **DEMO2345**.

## Attivare il database vero (Firebase)

Serve perché clienti e staff usino telefoni diversi con gli stessi dati.

1. Vai su <https://console.firebase.google.com> → *Aggiungi progetto*.
2. **Authentication** → *Inizia* → abilita **Email/Password**.
3. **Firestore Database** → *Crea database* (modalità produzione, regione `europe-west`).
4. Firestore → scheda **Regole** → incolla il contenuto di [`firestore.rules`](firestore.rules) → *Pubblica*.
5. Impostazioni progetto → *Le tue app* → icona **Web** (`</>`) → registra l'app e copia i valori di `firebaseConfig`
   in [`src/config/firebase.ts`](src/config/firebase.ts).
6. Riavvia `npx expo start`: il banner «Modalità demo» sparisce.

### Rendere un account «staff»

1. Registrati dall'app con l'account del personale.
2. Firebase → Firestore → collezione `users` → documento di quell'utente.
3. Cambia il campo `role` da `customer` a `staff` (o `admin`).
4. Riapri l'app: compare la scheda **Staff** con lo scanner.

## Dove personalizzare

| Cosa | File |
|------|------|
| Nome, telefono, WhatsApp, email, Instagram, indirizzo, orari | `src/config/venue.ts` |
| Logo ufficiale | salva `assets/images/logo.png` e imposta `VenueLogo` in `src/config/venue.ts` |
| Menù | `src/data/menu.ts` |
| Premi, costi in punti, foto/sfondi | `src/data/rewards.ts` (immagini in `assets/images/rewards/`) |
| Punti per euro, bonus benvenuto, livelli | `src/config/loyalty.ts` |
| Colori | `src/theme/colors.ts` |
| Icona app e splash | `assets/images/` + `app.json` |

> Se cambi il bonus di benvenuto, aggiorna anche `welcomeBonus()` in `firestore.rules`.

## Struttura

```
src/
  app/               schermate (Expo Router)
    (tabs)/          Home, Menù, Tessera, Premi, Staff, Info
    customer/[id]    gestione punti del cliente (staff)
    scan.tsx         scanner QR (staff)
  components/        UI riutilizzabile (tessera, card premio, …)
  config/            dati del locale, regole punti, Firebase
  data/              menù e premi
  services/          backend Firebase + backend demo locale
```

## Comandi utili

```bash
npx expo start          # avvia in sviluppo
npm run lint            # controllo codice
npm run typecheck       # controllo tipi TypeScript
npx eas-cli build -p android --profile preview   # APK installabile (serve account Expo)
```
