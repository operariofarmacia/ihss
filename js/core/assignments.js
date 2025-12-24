// /js/core/assignments.js
// Central assignment logic for beneficiaries (DH)

import { normalizeText, jobTitleMatch } from "./utils.js";

export function isEligiblePharma(user) {
  if (!user) return false;
  return normalizeText(user.role) === 'farmacia' && jobTitleMatch(user.jobTitle, 'revision y asignacion');
}

export function isEligibleCC(user) {
  if (!user) return false;
  const role = normalizeText(user.role);
  if (role !== 'contact_center') return false;
  // Accept "agente de contact center", "agentes de contact center", "agente contact center"
  const jobs = Array.isArray(user.jobTitle) ? user.jobTitle : [];
  const normJobs = jobs.map(normalizeText);
  return normJobs.some(j => j.includes('agente') && j.includes('contact center'));
}

export function pickRoundRobin(key, eligibleUsers) {
  const users = Array.isArray(eligibleUsers) ? eligibleUsers : [];
  if (!users.length) return null;
  const storeKey = `last_${key}_index`;
  let idx = parseInt(localStorage.getItem(storeKey) || '0', 10);
  if (Number.isNaN(idx) || idx < 0) idx = 0;
  const selected = users[idx % users.length];
  idx = (idx + 1) % users.length;
  localStorage.setItem(storeKey, String(idx));
  return selected;
}
