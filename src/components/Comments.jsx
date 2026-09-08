// src/components/Comments.jsx
import { useEffect, useState } from 'react';
import { db, auth, storage, googleProvider } from '../lib/firebaseConfig'; // ✅ correcta
import { serverTimestamp } from 'firebase/firestore';
import { Send } from 'lucide-react'; // o Heroicons, FontAwesome...
import { doc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { signInWithPopup } from 'firebase/auth';

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore';

export default function Comments({ appId }) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editedText, setEditedText] = useState('');


  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);
  
  useEffect(() => {
    if (!appId) return;
    
    
    const q = query(
      collection(db, 'comments'),
      where('appId', '==', appId),
      orderBy('timestamp', 'desc')
    );
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appComments = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((c) => !!c.timestamp); // ✅ Ignora los que no tengan timestamp
  
      setComments(appComments);
    });
  
    return () => unsubscribe();
  }, [appId]);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      localStorage.setItem("authToken", await user.getIdToken());
      localStorage.setItem("user", JSON.stringify({
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
      }));
      window.location.reload();
    } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;


await addDoc(collection(db, 'comments'), {
  appId,
  text: newComment.trim(),
  user,
  timestamp: serverTimestamp(),  // ✅ Esto sí es correcto
  likes: [],
  dislikes: []
});


    setNewComment('');
  };

      // 👍 Like
    const handleLike = async (id) => {
      if (!user) return;
      const ref = doc(db, 'comments', id);

    const current = comments.find((c) => c.id === id);
    const hasLiked = current?.likes?.includes(user.uid);
  
    await updateDoc(ref, {
      likes: hasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
      dislikes: arrayRemove(user.uid) // desactiva el dislike si existía
    });
  };


  // 👎 Dislike
    const handleDislike = async (id) => {
      if (!user) return;
      const ref = doc(db, 'comments', id);

      const current = comments.find((c) => c.id === id);
      const hasDisliked = current?.dislikes?.includes(user.uid);

      await updateDoc(ref, {
        dislikes: hasDisliked ? arrayRemove(user.uid) : arrayUnion(user.uid),
        likes: arrayRemove(user.uid) // desactiva el like si existía
      });
    };
  
  // 📝 Editar
  const handleEdit = (comment) => {
    setEditId(comment.id);
    setEditedText(comment.text);
  };
  
  const handleSaveEdit = async (id) => {
    const ref = doc(db, 'comments', id);
    await updateDoc(ref, { text: editedText });
    setEditId(null);
    setEditedText('');
  };
  
  // 🗑️ Eliminar
  const handleDelete = async (id) => {
    if (confirm('¿Seguro que deseas eliminar este comentario?')) {
      await deleteDoc(doc(db, 'comments', id));
    }
  };


  return (
    <div className="mt-6">

                {!user ? (
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm text-center mt-4">
              <p className="text-gray-700 mb-3 text-base">
                <span className="font-medium">Inicia sesión</span> para poder dejar un comentario
              </p>
              <button
                onClick={handleLogin}
                className="inline-flex items-center gap-2 px-5 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-4 h-4"
                />
                Iniciar con Google
              </button>
            </div>
          ) : (
  // ... formulario existente

        <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2 mt-4">
          <input
            type="text"
            placeholder="Escribe un comentario..."
            className="flex-1 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button
            type="submit"
            title="Enviar comentario"
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </form>
      )}

      <ul className="space-y-4 mt-6">
        {comments.map((c) => (
          <li key={c.id} className="bg-gray-100 p-3 rounded">
            <div className="flex items-center gap-2 mb-1">
              <img
                src={c.user?.photo}
                alt={c.user?.name}
                className="w-6 h-6 rounded-full border"
              />
              <span className="font-semibold text-sm">{c.user?.name}</span>
            </div>

            {editId === c.id ? (
              <div className="flex gap-2 mt-1">
                <input
                  className="flex-1 border px-2 py-1 rounded text-sm"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                />
                <button
                  onClick={() => handleSaveEdit(c.id)}
                  className="text-blue-600 text-sm"
                >
                  Guardar
                </button>
              </div>
            ) : (
              <p className="text-sm text-default">{c.text}</p>
            )}

            <div className="flex items-center gap-3 mt-2 text-sm text-default-soft">
              <button
                title="Me gusta"
                onClick={() => handleLike(c.id)}
                className={`flex items-center gap-1 hover:text-green-600 ${c.likes?.includes(user?.uid) ? "text-green-600 font-bold" : ""}`}
              >
                👍 {c.likes?.length || 0}
              </button>
              <button
                title="No me gusta"
                onClick={() => handleDislike(c.id)}
                className={`flex items-center gap-1 hover:text-red-600 ${c.dislikes?.includes(user?.uid) ? "text-red-600 font-bold" : ""}`}
              >
                👎 {c.dislikes?.length || 0}
              </button>

              {user?.uid === c.user?.uid && (
                <>
                  <button title="Editar" onClick={() => handleEdit(c)} className="text-blue-500">✏️</button>
                  <button title="Eliminar" onClick={() => handleDelete(c.id)} className="text-red-500">🗑️</button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}