// src/components/AuthProviderWrapper.jsx
import { AuthProvider } from "../hooks/useAuth.jsx";
import ConsultasDelUsuario from "./ConsultasDelUsuario";

export default function AuthProviderWrapper({ children }) {
  return (
    <AuthProvider>
      {/* Opcional: tu componente de consultas */}
      <ConsultasDelUsuario />
      {children}
    </AuthProvider>
  );
}
