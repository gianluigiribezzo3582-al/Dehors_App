/**
 * Configurazione Firebase.
 *
 * Finché `apiKey` è vuota l'app gira in MODALITÀ DEMO: i dati vengono salvati
 * solo sul telefono, utile per provare l'app subito. Per usare un vero database
 * condiviso tra clienti e staff, crea un progetto su https://console.firebase.google.com,
 * aggiungi una "Web app" e incolla qui i valori (vedi README).
 */
export const firebaseConfig = {
  apiKey: 'AIzaSyBFvHKThQZ4mycCkASFroBSY1FO2B33gxs',
  authDomain: 'dehors-897dc.firebaseapp.com',
  projectId: 'dehors-897dc',
  storageBucket: 'dehors-897dc.firebasestorage.app',
  messagingSenderId: '251469095750',
  appId: '1:251469095750:web:aae216d421f754f228fb47',
};

export const isFirebaseConfigured = firebaseConfig.apiKey.length > 0;
