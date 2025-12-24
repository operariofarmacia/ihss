// /js/core/firebase.js
// Firebase initialization (CDN ES Modules) for IHSS a tu Casa

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// ==== CONSTANTES DEL PROYECTO ====
export const APP_ID = "fdihss-mediflow-v2-modular";
export const DOMAIN_SUFFIX = "@mediflow.sys";

// ==== FIREBASE CONFIG REAL (NO CAMBIAR) ====
export const firebaseConfig = {
  apiKey: "AIzaSyAF7-qRJRi8Du5qe66hjviKZ3VG9A3ij6Y",
  authDomain: "farmaciadomi-97f94.firebaseapp.com",
  projectId: "farmaciadomi-97f94",
  storageBucket: "farmaciadomi-97f94.firebasestorage.app",
  messagingSenderId: "893008623562",
  appId: "1:893008623562:web:860d3b20a339efd1180133"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Device fingerprint (single key used across the whole project)
export function getDeviceId() {
  let deviceId = localStorage.getItem("mediflow_device_id");
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("mediflow_device_id", deviceId);
  }
  return deviceId;
}
