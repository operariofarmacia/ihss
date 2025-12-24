// /js/core/idle.js

import { signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { auth } from "./firebase.js";

export function startIdleLogout({ minutes = 30, onTimeout } = {}) {
  const timeoutMs = Math.max(1, minutes) * 60 * 1000;
  let timer = null;

  const reset = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      try { await signOut(auth); } catch (e) {}
      if (typeof onTimeout === 'function') {
        try { onTimeout(); return; } catch (e) {}
      }
      // default: go to login
      window.location.href = 'index.html';
    }, timeoutMs);
  };

  const events = ['mousemove','mousedown','keydown','scroll','touchstart','touchmove','click'];
  events.forEach(ev => window.addEventListener(ev, reset, { passive: true }));
  reset();

  return () => {
    events.forEach(ev => window.removeEventListener(ev, reset));
    if (timer) clearTimeout(timer);
  };
}
