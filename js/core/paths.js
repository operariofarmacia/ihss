// /js/core/paths.js

import { doc, collection } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { db, APP_ID } from "./firebase.js";

export const profileRef = (uid) => doc(db, 'artifacts', APP_ID, 'users', uid, 'profile', 'data');

export const usersDirectoryCol = () => collection(db, 'artifacts', APP_ID, 'public', 'data', 'users_directory');
export const beneficiariesCol = () => collection(db, 'artifacts', APP_ID, 'public', 'data', 'beneficiaries');
export const shipmentsCol = () => collection(db, 'artifacts', APP_ID, 'public', 'data', 'shipments');
export const geoAreasCol = () => collection(db, 'artifacts', APP_ID, 'public', 'data', 'geographic_areas');
