import { useAuth } from "../hooks/useAuth";

export default function LogoutButton() {
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    try {
  // ✅ Logout unificado (cookie SSO + Firebase local) desde el hook
     await logout();
    } finally {
      localStorage.clear();
      window.location.href = "/";
    }
  };
  
    return (
      <button
        onClick={handleLogout}
        className="bg-black text-white px-4 py-2 rounded-md hover:bg-default transition"
      >
        Cerrar sesión
      </button>
    );
  }
  