// /js/core/secondary.js
// Secondary Firebase app used to create users (or emergency admin) without affecting current session.

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, setPersistence, inMemoryPersistence } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

import { firebaseConfig } from "./firebase.js";

let secondaryApp = null;
let secondaryAuth = null;
let secondaryDb = null;

export async function getSecondary() {
  if (!secondaryApp) {
    secondaryApp = initializeApp(firebaseConfig, "secondary");
    secondaryAuth = getAuth(secondaryApp);
    secondaryDb = getFirestore(secondaryApp);
    // Keep it memory-only to avoid disturbing the main session
    try { await setPersistence(secondaryAuth, inMemoryPersistence); } catch (e) {}
  }
  return { secondaryApp, secondaryAuth, secondaryDb };
}
