import { useState, useEffect } from "react";
import { db, auth, storage, googleProvider } from '../lib/firebaseConfig'; // ✅ correcta
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

export default function RatingStars({ appId }) {
  const [user, setUser] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [avgRating, setAvgRating] = useState(null);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Suscripción en tiempo real para mantener sincronizado el promedio
  useEffect(() => {
    if (!appId) return;

    const q = query(collection(db, "ratings"), where("appId", "==", appId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let total = 0;
      let count = snapshot.size;
      let currentUserRating = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        total += data.rating;
        if (user && data.userId === user.uid) {
          currentUserRating = data.rating;
        }
      });

      setAvgRating(count > 0 ? (total / count).toFixed(1) : null);
      setTotalVotes(count);
      setUserRating(currentUserRating);
    });

    return () => unsubscribe();
  }, [appId, user]);

  // Enviar o actualizar la calificación
  const submitRating = async (value) => {
    if (!user) return alert("Inicia sesión para calificar");

    const ratingsRef = collection(db, "ratings");
    const q = query(
      ratingsRef,
      where("appId", "==", appId),
      where("userId", "==", user.uid)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const ref = snapshot.docs[0].ref;

      if (userRating === value) {
        // 🔥 Si hace clic sobre la misma estrella, elimina la calificación

      await updateDoc(ref, {
        rating: 0,
        timestamp: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        rating: value,
        timestamp: serverTimestamp(),
      });
    }
    } else {
      await addDoc(ratingsRef, {
        appId,
        userId: user.uid,
        rating: value,
        timestamp: serverTimestamp(),
      });
    }
  };

  // Si no hay sesión
  if (!user) {
    return (
      <p className="text-sm text-gray-500 italic">
        Inicia sesión para calificar esta app.
      </p>
    );
  }

  return (
<div className="w-full flex flex-col items-center mb-3">
  {avgRating && (
    <p className="text-sm text-default-soft mb-1">
      Promedio: <strong>{avgRating}</strong> / 5 ⭐ ({totalVotes} voto{totalVotes !== 1 ? "s" : ""})
    </p>
  )}

  <div className="flex justify-center gap-1 text-yellow-500">
    {[1, 2, 3, 4, 5].map((i) => (
      <button
        key={i}
        onClick={() => submitRating(i)}
        className={i <= userRating ? "font-bold" : "opacity-40"}
        title={`Calificar con ${i} estrella${i > 1 ? "s" : ""}`}
      >
        ⭐
      </button>
    ))}
  </div>
</div>

  );
}
