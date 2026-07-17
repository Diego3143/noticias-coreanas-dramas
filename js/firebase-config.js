// Configuración de Firebase para el Portal de Noticias
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Extraído de google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyAfqvmcg2Y6GOAQOVjFvXi46hp3NTCT6ZE",
  authDomain: "abby-cdb30.firebaseapp.com",
  databaseURL: "https://abby-cdb30-default-rtdb.firebaseio.com",
  projectId: "abby-cdb30",
  storageBucket: "abby-cdb30.appspot.com",
  messagingSenderId: "738241914654",
  appId: "1:738241914654:android:80351b3fed2f4dc3688b0f"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

export { app, auth, db, storage };
