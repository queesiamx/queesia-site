import { useEffect, useState } from 'react';
import { db } from '../lib/firebaseConfig';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc
} from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';

export default function ConsultasDelUsuario() {
  const [consultas, setConsultas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'consultasModeradas'),
      where('correo', '==', user.email)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const consultasConFoto = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          let fotoPerfilURL = null;

          // Si hay expertoId, busca en la colección 'experts'
          if (data.expertoId) {
            try {
              const expertoRef = doc(db, 'experts', data.expertoId);
              const expertoSnap = await getDoc(expertoRef);
              if (expertoSnap.exists()) {
                const expertoData = expertoSnap.data();
                fotoPerfilURL = expertoData.fotoPerfilURL || null;
              }
            } catch (error) {
              console.error('Error obteniendo datos del experto:', error);
            }
          }

          return {
            id: docSnap.id,
            ...data,
            fotoPerfilURL, // nuevo campo inyectado
          };
        })
      );

      setConsultas(consultasConFoto);
      setCargando(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (cargando) {
    return <p className="text-center text-gray-700">Cargando tus consultas...</p>;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        📝 <span className="text-yellow-900">Mis Consultas</span>
      </h2>

      {consultas.length === 0 ? (
        <p className="text-center text-gray-600">No has enviado ninguna consulta aún.</p>
      ) : (
        consultas.map((c) => (
          <div
            key={c.id}
            className="mb-6 p-5 rounded-xl bg-white shadow-md border border-yellow-200"
          >
            <h3 className="font-semibold text-red-600 flex items-center gap-2 mb-1">
              📌 Consulta:
            </h3>
            <p className="mb-2">{c.consulta}</p>

            <p className="mb-2 font-semibold text-yellow-700">
              Estado: <span className="font-normal text-gray-800">{c.estado}</span>
            </p>

            

            {c.estado === 'respondida' && (
              <>
                <h4 className="text-green-600 font-semibold flex items-center gap-2 mb-2">
                  ✅ Respuesta:
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg text-gray-900 whitespace-pre-wrap">
                  {c.respuesta}
                </div>
                <div className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                  {c.fotoPerfilURL && (
                    <img
                      alt={`Foto de ${c.expertoNombre || 'experto'}`}
                      className="w-5 h-5 rounded-full"
                      src={c.fotoPerfilURL}
                    />
                  )}
                  {c.expertoId ? (
  <a
    href={`https://expertos.queesia.com/expertos/${c.expertoId}`}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-700 underline hover:text-blue-900"
  >
    <strong>{c.expertoNombre}</strong>
  </a>
) : (
  <span><strong>{c.expertoNombre}</strong></span>
)}

                  {c.timestamp && (
                    <span className="ml-2 italic">
                      ({new Date(c.timestamp.seconds * 1000).toLocaleString()})
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        ))
      )}
    </section>
  );
}
