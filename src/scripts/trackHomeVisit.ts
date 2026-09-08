// src/scripts/trackHomeVisit.ts
import { db } from "../lib/firebaseConfig"; // si no tienes alias "@", usa "../../lib/firebase"
import { doc, runTransaction, serverTimestamp, onSnapshot } from "firebase/firestore";

const KEY = "q_home_visit_v1"; // evita sumar más de 1 vez por día en el mismo navegador

export async function trackHomeVisit() {
  try {
    const today = new Date().toDateString();
    if (localStorage.getItem(KEY) === today) return;

    const ref = doc(db, "visitCounts", "quesiaHome");

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);

      if (!snap.exists()) {
        tx.set(ref, { count: 1 });
        return;
      }

      const current = Number(snap.data()?.count || 0);

      tx.update(ref, {
        count: current + 1,
      });
    });

    localStorage.setItem(KEY, today);
  } catch (err) {
    console.debug("[visitas] no incrementó:", err);
  }
}

export function listenHomeVisits(cb: (n: number) => void) {
  const ref = doc(db, "visitCounts", "quesiaHome");
  return onSnapshot(ref, (snap) => {
    cb(Number(snap.data()?.count || 0));
  });
}
