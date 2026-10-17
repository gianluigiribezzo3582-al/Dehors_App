# Dehors Cafè-Bistrot – app del locale

App Android/iOS (Expo + React Native) per **Dehors Cafè-Bistrot** (Via Giuseppe Re David 197, Bari):

- **Registrazione / login** dei clienti, ciascuno con la propria **tessera digitale con QR** e codice tessera.
- **Menù** consultabile in app, con ricerca, categorie e indicazioni (vegano, senza glutine, novità…).
- **Tessera punti**: saldo, livello (Bronze/Silver/Gold), storico movimenti in tempo reale.
- **Premi**: card con foto/sfondo, barra di avanzamento e premi sbloccati.
- **Area staff** (visibile solo agli account staff): si inquadra il QR del cliente (o si digita il codice tessera, o si cerca per email) e si
  - aggiungono punti in base all'importo speso (1 pt per €, configurabile),
  - riscatta un premio (scala i punti),
  - corregge il saldo a mano con nota.
- **Info & contatti**: chiama il locale con un tocco, WhatsApp, Instagram, email, indicazioni stradali, orari con stato «Aperto ora».
- Tema chiaro (sfondo bianco) e scuro (sfondo nero) che segue automaticamente l'impostazione del telefono, colori verde scuro / marrone.

## Sicurezza dell'area staff

L'area staff (scheda Staff, scanner, gestione punti del cliente) è protetta su tre livelli:

1. **Navigazione**: le rotte staff esistono solo per gli account con ruolo `staff` o `admin` (`Stack.Protected` / `Tabs.Protected`).
   Per tutti gli altri la scheda non compare e i link diretti riportano alla Home. All'avvio l'app aspetta di conoscere il ruolo prima di mostrare qualsiasi schermata.
2. **Schermate**: ogni schermata staff è avvolta in `StaffOnly`, che non mostra nulla a chi non è staff.
3. **Dati**: le regole Firestore (`firestore.rules`) permettono di cercare clienti, modificare punti e contenuti (menù, premi, testi, eventi) e leggere i destinatari delle notifiche solo allo staff, e impediscono a chiunque di cambiarsi il ruolo da solo. Il ruolo si assegna solo dalla console Firebase. Le regole sono coperte da 45 test (`npm run test:rules`).

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

## Gestione contenuti dall'app (staff)

Dalla scheda **Staff → Gestione app** lo staff modifica, senza aggiornare l'app sugli store:

| Sezione | Cosa si cambia |
|---------|----------------|
| Menù | categorie (nome, icona, nota), voci (nome, ingredienti, prezzo o testo prezzo, surgelato, vegano, senza glutine, settimana), «Non disponibile», ordine |
| Esauriti | interruttore per ogni voce del menù e del pranzo: i clienti vedono subito «Esaurito»; «Rendi tutto disponibile» a inizio giornata |
| Pranzo del giorno | piatti di oggi (nome, descrizione, prezzo facoltativo), nota, fascia oraria di visibilità (predefinita 10:00–15:00): compare in Home e in cima al Menù solo in quella fascia |
| Eventi | titolo, data e ora, descrizione, pubblicato/bozza; alla pubblicazione può partire una notifica a tutti |
| Premi | nome, descrizione, punti, icona, colore, **riscattabile una volta o più volte**, attivo/disattivo |
| Testi, contatti e orari | avviso in Home, testi di benvenuto, punti per euro, telefoni, WhatsApp, email, indirizzo, Instagram, Facebook, sito, orari |
| Invia notifica | messaggio libero a tutti, con apertura facoltativa di un evento |

I contenuti sono salvati su Firestore (`content/menu`, `content/rewards`, `content/texts`, `content/lunch`, `content/availability`, collezione `events`) e arrivano ai clienti in tempo reale; l'app ne tiene una copia per l'uso offline. I valori nei file `src/data/*.ts` e `src/config/*.ts` servono solo come contenuto iniziale.

## Notifiche push (configurazione una tantum)

L'invio usa il servizio gratuito di Expo. Finché non è configurato, «Invia notifica» mostra solo un'anteprima sul telefono dello staff.

1. Crea un account su <https://expo.dev> e, dalla cartella del progetto, esegui `npx eas-cli@latest login` e poi `npx eas-cli@latest init`: aggiunge `extra.eas.projectId` in `app.json`.
2. Nella console Firebase → Impostazioni progetto → aggiungi un'app **Android** con ID pacchetto `it.dehors.app`, scarica `google-services.json` nella cartella principale e aggiungi in `app.json`, sotto `android`, `"googleServicesFile": "./google-services.json"`.
3. Firebase → Impostazioni progetto → Account di servizio → «Genera nuova chiave privata»; su expo.dev → progetto → Credentials → Android → FCM V1 carica quel file JSON.
4. Ricompila l'app. Da quel momento i telefoni si registrano all'avvio (dopo il consenso alle notifiche) e lo staff invia a tutti.

## Dove personalizzare (codice)

| Cosa | File |
|------|------|
| Nome del locale, dati societari, PEC, coordinate | `src/config/venue.ts` |
| Contenuti iniziali (menù, premi, testi) | `src/data/menu.ts`, `src/data/rewards.ts`, `src/content/defaults.ts` |
| Logo | pittogramma vettoriale in `src/config/logo.ts` (copia in `assets/brand/logo-mark.svg`), scritta in carattere Urbanist; icone e splash in `assets/images/` |
| Bonus benvenuto, livelli | `src/config/loyalty.ts` (il bonus va aggiornato anche in `firestore.rules`) |
| Colori | `src/theme/colors.ts` |

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
npm run test:rules      # test delle regole di sicurezza Firestore (serve Java)
npx eas-cli build -p android --profile preview   # APK installabile (serve account Expo)
```
