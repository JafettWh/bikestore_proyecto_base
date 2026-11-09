import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import "../assets/styles.css";

// Protege una vista según la sesión y el rol (RF-30 / RNF-04).
// Si el usuario no tiene permiso, no renderiza nada y llama a onDenied
// (por ejemplo, para enviarlo al inicio de sesión).
export default function ProtectedRoute({ roles, onDenied, children }) {
  const { currentUser } = useAuth();
  const allowed = Boolean(currentUser) && (!roles || roles.includes(currentUser.role));

  useEffect(() => {
    if (!allowed && onDenied) onDenied();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed]);

  return allowed ? children : null;
}
