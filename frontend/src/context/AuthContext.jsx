import { createContext, useEffect, useState } from "react";
import { apiRequest } from "../utils/api";

export const AuthContext = createContext(undefined);

function storedToken() {
  return localStorage.getItem("bikestore_token");
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(storedToken);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isReady, setIsReady] = useState(!storedToken());
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const savedToken = storedToken();
    if (!savedToken) {
      localStorage.removeItem("bikestore_auth_user");
      setIsReady(true);
      return;
    }

    apiRequest("/auth/me", { token: savedToken })
      .then(({ user }) => setCurrentUser(user))
      .catch((error) => {
        if (error.status === 401) {
          localStorage.removeItem("bikestore_token");
          localStorage.removeItem("bikestore_auth_user");
          setToken(null);
        } else {
          setAuthError(error.message);
        }
      })
      .finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("bikestore_auth_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("bikestore_auth_user");
    }
  }, [currentUser]);

  const refreshUsers = async (filters = {}) => {
    if (!token) return [];
    const query = new URLSearchParams(filters).toString();
    const { data } = await apiRequest(`/admin/users${query ? `?${query}` : ""}`, { token });
    setUsers(data);
    return data;
  };

  useEffect(() => {
    if (token && currentUser?.role === "admin") {
      refreshUsers().catch((error) => setAuthError(error.message));
    } else {
      setUsers([]);
    }
  }, [token, currentUser?.role]);

  const login = async (email, password) => {
    try {
      const { token: newToken, user } = await apiRequest("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      localStorage.setItem("bikestore_token", newToken);
      setToken(newToken);
      setCurrentUser(user);
      setAuthError("");
      return { success: true, message: `Bienvenido, ${user.name}`, user };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("bikestore_token");
    setToken(null);
    setCurrentUser(null);
    setUsers([]);
  };

  const register = async (name, email, password, phone, acceptedTerms) => {
    try {
      const { data } = await apiRequest("/auth/register", {
        method: "POST",
        body: { name, email, password, phone, acceptedTerms },
      });
      return { success: true, message: "Cuenta creada. Inicia sesión para continuar.", user: data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const addUser = async (userData) => {
    try {
      await apiRequest("/admin/users", { method: "POST", token, body: userData });
      await refreshUsers();
      return { success: true, message: "Usuario creado exitosamente." };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updateUser = async (id, data) => {
    try {
      const { data: updatedUser } = await apiRequest(`/admin/users/${id}`, {
        method: "PUT",
        token,
        body: data,
      });
      await refreshUsers();
      if (currentUser?.id === Number(id)) setCurrentUser(updatedUser);
      return { success: true, message: "Usuario actualizado exitosamente." };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const deactivateUser = async (id) => {
    try {
      await apiRequest(`/admin/users/${id}/deactivate`, { method: "PATCH", token });
      await refreshUsers();
      return { success: true, message: "Usuario inactivado exitosamente." };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updateProfile = async (data) => {
    try {
      const { user } = await apiRequest("/auth/me", { method: "PATCH", token, body: data });
      setCurrentUser(user);
      return { success: true, user, message: "Datos de perfil actualizados exitosamente." };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        token,
        isReady,
        authError,
        login,
        logout,
        register,
        addUser,
        updateUser,
        deactivateUser,
        updateProfile,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
