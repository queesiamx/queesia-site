// src/lib/ssoClient.js
const SSO_BASE = "https://expertos.queesia.com";

export const SSO_ENDPOINTS = {
  login: `${SSO_BASE}/api/trackVisit?action=login`,
  me: `${SSO_BASE}/api/trackVisit?action=me`,
  logout: `${SSO_BASE}/api/trackVisit?action=logout`,
  customtoken: `${SSO_BASE}/api/trackVisit?action=customtoken`,
};

async function safeJson(r) {
  try {
    return await r.json();
  } catch {
    return {};
  }
}

export async function ssoLoginWithIdToken(idToken) {
  const r = await fetch(SSO_ENDPOINTS.login, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ idToken }),
  });
  const data = await safeJson(r);
  return { ok: r.ok, ...data };
}

export async function ssoWhoAmI() {
  const r = await fetch(SSO_ENDPOINTS.me, { method: "GET", credentials: "include" });
  const data = await safeJson(r);
  if (!r.ok) return { user: null, ...data };
  return data; // { user: decoded } o { user: null }
}

export async function ssoGetCustomToken() {
  const r = await fetch(SSO_ENDPOINTS.customtoken, { method: "GET", credentials: "include" });
  const data = await safeJson(r);
  return { ok: r.ok, ...data }; // { ok:true, customToken } o { ok:false, error }
}

export async function ssoLogout() {
  const r = await fetch(SSO_ENDPOINTS.logout, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({}),
  });
  const data = await safeJson(r);
  return { ok: r.ok, ...data };
}
