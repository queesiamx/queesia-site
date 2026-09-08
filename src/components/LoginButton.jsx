// src/components/LoginButton.jsx — catálogo de apps (Quesia)
// Menú unificado estilo expertos: Ir a mi panel, Mis X, Mi Perfil, Cerrar sesión
import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { menuControl } from "../hooks/useMenuControl";

export default function LoginButton() {
  const { user, login, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
  
  const menuUnsub = menuControl.subscribe((menu) => {
    if (menu !== "avatar") setOpenMenu(false);
  });

  return () => {
   
    menuUnsub();
  };
}, []);


   const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };



  const handleLogout = async () => {
    try {

     await logout();
      localStorage.clear();
      
      window.location.href = "/";
    } catch (error) {
      console.error("Error al cerrar sesión:", error.message);
    }
  };

  const toggleMenu = () => {
    const newState = !openMenu;
    setOpenMenu(newState);
    if (newState) menuControl.openMenu("avatar");
  };

  // ⚙️ Configuración común con expertos
  const adminEmails = ["queesiamx@gmail.com", "queesiamx.employee@gmail.com"];
  const isAdmin = user && adminEmails.includes(user.email);
  const baseExpertos = "https://expertos.queesia.com"; // ajusta si tu ruta base es otra

  if (user) {
    return (
      <div className="relative">
        {/* Avatar igual que en expertos */}
        <img
           src={user.photoURL}
          alt={user.displayName || user.email}
          className="w-10 h-10 rounded-full border border-white shadow hover:ring-2 hover:ring-primary transition duration-300 cursor-pointer object-cover"
          title={user.displayName || user.email}
          onClick={toggleMenu}
        />

        {openMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50 overflow-hidden">
            {/* Header: nombre + correo */}
            <div className="px-4 py-3 border-b">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {user.displayName || user.email}
              </div>
              {user.email && (
                <div className="text-xs text-gray-600 truncate">
                  {user.email}
                </div>
              )}
            </div>

            {/* Opciones tipo USUARIO (todas apuntan al dominio de expertos) */}
            <nav className="py-1">
              <a
                href={`${baseExpertos}/`}
                onClick={() => setOpenMenu(false)}
                className="block px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
              >
                📂 Ir a mi panel
              </a>

              <a
                href={`${baseExpertos}/mis-consultas`}
                onClick={() => setOpenMenu(false)}
                className="block px-4 py-2 text-sm hover:bg-gray-100"
              >
                Mis Consultas
              </a>
              <a
                href={`${baseExpertos}/mis-compras`}
                onClick={() => setOpenMenu(false)}
                className="block px-4 py-2 text-sm hover:bg-gray-100"
              >
                Mis Compras
              </a>
              <a
                href={`${baseExpertos}/mis-valoraciones`}
                onClick={() => setOpenMenu(false)}
                className="block px-4 py-2 text-sm hover:bg-gray-100"
              >
                Mis valoraciones
              </a>
              <a
                href={`${baseExpertos}/perfil`}
                onClick={() => setOpenMenu(false)}
                className="block px-4 py-2 text-sm hover:bg-gray-100"
              >
                Mi Perfil
              </a>

              {/* Panel Admin opcional para correos admin */}
              {isAdmin && (
                <a
                  href={`${baseExpertos}/admin-expertos`}
                  onClick={() => setOpenMenu(false)}
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Panel Admin
                </a>
              )}
            </nav>

            {/* Footer: Cerrar sesión */}
            <div className="border-t">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Botón de login (igual que antes)
  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-2 bg-black text-white text-sm font-medium px-3 py-1.5 rounded-xl shadow hover:bg-gray-800 transition duration-300 border border-transparent hover:border-white"
    >
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google"
        className="w-4 h-4"
      />
      <span className="hidden md:inline">Iniciar sesión</span>
    </button>
  );
}
