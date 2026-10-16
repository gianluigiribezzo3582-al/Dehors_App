/**
 * Configurazione Firebase.
 *
 * Finché `apiKey` è vuota l'app gira in MODALITÀ DEMO: i dati vengono salvati
 * solo sul telefono, utile per provare l'app subito. Per usare un vero database
 * condiviso tra clienti e staff, crea un progetto su https://console.firebase.google.com,
 * aggiungi una "Web app" e incolla qui i valori (vedi README).
 */
export const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

export const isFirebaseConfigured = firebaseConfig.apiKey.length > 0;
