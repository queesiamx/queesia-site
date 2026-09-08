// src/components/AuthLoginIsland.jsx
import React from "react";
import { AuthProvider } from "../hooks/useAuth";
import LoginButton from "./LoginButton.jsx";

export default function AuthLoginIsland() {
  return (
    <AuthProvider>
      <LoginButton />
    </AuthProvider>
 );
}
