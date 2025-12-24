// /js/core/emergencyAdmin.js
// Creates an emergency admin user without affecting the current session.
// ⚠️ CAMBIAR admin2025 en producción.

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, setDoc, query, where, getDocs, limit, collection } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

import { APP_ID, DOMAIN_SUFFIX } from "./firebase.js";
import { getSecondary } from "./secondary.js";

function profileDoc(db, uid) {
  return doc(db, 'artifacts', APP_ID, 'users', uid, 'profile', 'data');
}

function usersDirectoryCollection(db) {
  return collection(db, 'artifacts', APP_ID, 'public', 'data', 'users_directory');
}

export async function ensureEmergencyAdmin() {
  const { secondaryAuth, secondaryDb } = await getSecondary();

  // 1) Check if users_directory already contains username "admin"
  try {
    const q = query(usersDirectoryCollection(secondaryDb), where('username','==','admin'), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) return { existed: true };
  } catch (e) {
    // ignore and attempt create
  }

  const email = `admin${DOMAIN_SUFFIX || '@mediflow.sys'}`;
  const password = 'admin2025';

  let cred = null;
  try {
    cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
  } catch (e) {
    // If exists, sign in to get uid
    cred = await signInWithEmailAndPassword(secondaryAuth, email, password);
  }

  const uid = cred.user.uid;

  // 2) Ensure profile
  await setDoc(profileDoc(secondaryDb, uid), {
    dni: "",
    name: "Super Admin",
    username: "admin",
    role: "admin",
    jobTitle: ["Super Admin"],
    requireIpApproval: false,
    ipUnlockKey: "",
    authorizedDevices: [],
    activeSessionId: "",
    status: "active",
    lastLogin: ""
  }, { merge: true });

  // 3) Ensure directory doc (use uid as docId to avoid duplicates)
  await setDoc(doc(usersDirectoryCollection(secondaryDb), uid), {
    uid,
    dni: "",
    name: "Super Admin",
    username: "admin",
    role: "admin",
    jobTitle: ["Super Admin"],
    createdAt: new Date().toISOString()
  }, { merge: true });

  return { existed: false, uid };
}
