// src/hooks/useAuth.js
import { useEffect, useState, useContext, createContext, useMemo } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut,
  signInWithCustomToken,
} from "firebase/auth";
import { auth } from "../lib/firebaseConfig"; // tu config actual
import { ssoLogout, ssoWhoAmI, ssoGetCustomToken, ssoLoginWithIdToken } from "../lib/ssoClient";

const AuthContext = createContext({
  user: null,
  ready: false,
  login: async () => {},
  logout: async () => {},
  getToken: async () => null,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setReady(true);
    });

    // 🔁 Auto-sync SSO (recomendado): alinear cookie SSO vs sesión Firebase local
    async function syncWithSSO() {
      try {
        const me = await ssoWhoAmI(); // { user: ... } o { user: null }
        const cookieHasUser = !!me?.user?.uid;
        const fbHasUser = !!auth.currentUser;

        // Caso A: cookie OFF pero Firebase ON -> cerrar Firebase local
        if (!cookieHasUser && fbHasUser) {
          console.info("[SSO] cookie OFF -> signOut(firebase)");
          await signOut(auth);
          return;
        }

        // Caso B: cookie ON pero Firebase OFF -> bridge -> Firebase local ON
        if (cookieHasUser && !fbHasUser) {
          const tok = await ssoGetCustomToken();
          if (tok?.ok && tok.customToken) {
            console.info("[SSO] cookie ON -> signInWithCustomToken(firebase)");
            await signInWithCustomToken(auth, tok.customToken);
          }
        }
      } catch {}
    }

    // corre al montar
    syncWithSSO();
   // polling para reflejar login/logout cross-subdominio sin refresh
    const t = setInterval(syncWithSSO, 4000); // 3–10s recomendado
    // y cuando el usuario vuelve a la pestaña (sin esperar refresh)
    const onFocus = () => syncWithSSO();
    const onVis = () => { if (!document.hidden) syncWithSSO(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);

      return () => {
     clearInterval(t);
     window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
      unsub();
    };
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);

      // 🔐 1) ID token (Firebase client)
      const idToken = await result.user.getIdToken(true);

      // 🔐 2) Handshake con expertos -> set-cookie Domain=.queesia.com
      await ssoLoginWithIdToken(idToken);
    } catch (e) {
      // Si el popup es bloqueado por el navegador, usa redirect como fallback
      if (e?.code === "auth/popup-blocked") {
        await signInWithRedirect(auth, provider);
      } else {
        console.error("[auth] login error:", e);
      }
    }
  };

  const logout = async () => {
    try {
      // ✅ 1) Borra cookie SSO global
      await ssoLogout();

      // ✅ 2) Cierra Firebase local
      await signOut(auth);
    } catch (e) {
      console.error("[auth] logout error:", e);
    }
  };

  const getToken = async (forceRefresh = false) => {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken(forceRefresh);
  };

  const value = useMemo(
    () => ({ user, ready, login, logout, getToken }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
