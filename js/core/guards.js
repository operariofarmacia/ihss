// /js/core/guards.js

import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { auth, getDeviceId } from "./firebase.js";
import { profileRef } from "./paths.js";
import { isWithinSchedule, jobTitleAnyMatch, normalizeText } from "./utils.js";

function renderBlocked({ title, message, buttonText = "Volver al Login" } = {}) {
  document.body.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f8fafc;font-family:Poppins,system-ui,Arial;">
      <div style="max-width:520px;width:92%;background:white;border:1px solid #e2e8f0;border-radius:18px;padding:26px;box-shadow:0 10px 30px rgba(2,6,23,0.08);text-align:center;">
        <div style="width:64px;height:64px;border-radius:999px;background:#fee2e2;color:#b91c1c;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px;">🔒</div>
        <h2 style="margin:0 0 6px;font-size:20px;color:#0f172a;">${title || "Acceso denegado"}</h2>
        <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.4;">${message || "No tienes permisos para entrar a este módulo."}</p>
        <a href="index.html" style="display:inline-block;background:#003366;color:white;padding:12px 18px;border-radius:12px;text-decoration:none;font-weight:700;">${buttonText}</a>
      </div>
    </div>
  `;
}

export async function requireAuthAndPolicy({ allowedRoles = [], allowedJobTitles = [], allowAdminBypass = true } = {}) {
  const deviceId = getDeviceId();

  const user = await new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      unsub();
      resolve(u || null);
    });
  });

  if (!user) {
    window.location.href = 'index.html';
    throw new Error('NO_AUTH');
  }

  const snap = await getDoc(profileRef(user.uid));
  if (!snap.exists()) {
    await signOut(auth);
    renderBlocked({ title: 'Perfil no encontrado', message: 'Tu perfil no existe en la base de datos. Contacta al administrador.' });
    throw new Error('PROFILE_NOT_FOUND');
  }

  const profile = snap.data();

  // Sesión única (excepto admin)
  if (profile.role !== 'admin' && profile.activeSessionId && profile.activeSessionId !== deviceId) {
    await signOut(auth);
    renderBlocked({ title: 'Sesión en otro dispositivo', message: 'Tu sesión está activa en otro dispositivo. Cierra sesión en el otro dispositivo o contacta al admin.' });
    throw new Error('OTHER_DEVICE');
  }

  // requireIpApproval → authorizedDevices
  if (profile.role !== 'admin' && profile.requireIpApproval === true) {
    const list = Array.isArray(profile.authorizedDevices) ? profile.authorizedDevices : [];
    if (!list.includes(deviceId)) {
      await signOut(auth);
      renderBlocked({ title: 'Dispositivo no autorizado', message: 'Este dispositivo no está autorizado. Ingresa desde el login y valida tu llave.' });
      throw new Error('DEVICE_NOT_AUTHORIZED');
    }
  }

  // Horario/días
  if (profile.role !== 'admin' && !isWithinSchedule(profile)) {
    await signOut(auth);
    renderBlocked({ title: 'Fuera de horario', message: 'Tu usuario está fuera del horario o día permitido.' });
    throw new Error('OUT_OF_SCHEDULE');
  }

  const role = normalizeText(profile.role);
  const isAdmin = role === 'admin';

  if (!isAdmin || !allowAdminBypass) {
    if (allowedRoles.length) {
      const okRole = allowedRoles.map(normalizeText).includes(role);
      if (!okRole) {
        await signOut(auth);
        renderBlocked({ title: 'Rol incorrecto', message: 'Tu rol no tiene permisos para este módulo.' });
        throw new Error('ROLE_DENIED');
      }
    }

    if (allowedJobTitles.length) {
      const okJob = jobTitleAnyMatch(profile.jobTitle, allowedJobTitles);
      if (!okJob) {
        await signOut(auth);
        renderBlocked({ title: 'Sin función asignada', message: 'Tu usuario no tiene el jobTitle requerido para este módulo. Pídele al admin que te lo asigne.' });
        throw new Error('JOB_DENIED');
      }
    }
  }

  return { user, profile, deviceId };
}

export function watchProfileWithPolicy(userId, policy, onOk) {
  return onSnapshot(profileRef(userId), async (snap) => {
    if (!snap.exists()) return;
    const profile = snap.data();
    try {
      // Re-validate by reusing the same logic but without extra reads.
      // We do minimal checks here to avoid recursion.
      const deviceId = getDeviceId();
      if (profile.role !== 'admin' && profile.activeSessionId && profile.activeSessionId !== deviceId) {
        await signOut(auth);
        renderBlocked({ title: 'Sesión en otro dispositivo', message: 'Tu sesión está activa en otro dispositivo.' });
        return;
      }
      if (profile.role !== 'admin' && profile.requireIpApproval === true) {
        const list = Array.isArray(profile.authorizedDevices) ? profile.authorizedDevices : [];
        if (!list.includes(deviceId)) {
          await signOut(auth);
          renderBlocked({ title: 'Dispositivo no autorizado', message: 'Este dispositivo no está autorizado.' });
          return;
        }
      }
      if (profile.role !== 'admin' && !isWithinSchedule(profile)) {
        await signOut(auth);
        renderBlocked({ title: 'Fuera de horario', message: 'Tu usuario está fuera del horario/día permitido.' });
        return;
      }

      const role = normalizeText(profile.role);
      const isAdmin = role === 'admin';
      if (!isAdmin || policy?.allowAdminBypass === false) {
        if (policy?.allowedRoles?.length) {
          const okRole = policy.allowedRoles.map(normalizeText).includes(role);
          if (!okRole) {
            await signOut(auth);
            renderBlocked({ title: 'Rol incorrecto', message: 'Tu rol no tiene permisos para este módulo.' });
            return;
          }
        }
        if (policy?.allowedJobTitles?.length) {
          const okJob = jobTitleAnyMatch(profile.jobTitle, policy.allowedJobTitles);
          if (!okJob) {
            await signOut(auth);
            renderBlocked({ title: 'Sin función asignada', message: 'Tu usuario no tiene el jobTitle requerido.' });
            return;
          }
        }
      }

      if (typeof onOk === 'function') onOk(profile);
    } catch (e) {
      console.warn('watchPolicy error', e);
    }
  });
}
