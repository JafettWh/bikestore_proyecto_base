import { createContext, useState, useEffect } from "react";
import { initialUsers } from "../data/mockDb";
export const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem("bikestore_users");
        return saved ? JSON.parse(saved) : initialUsers;
    });
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem("bikestore_auth_user");
        return saved ? JSON.parse(saved) : null;
    });
    useEffect(() => {
        localStorage.setItem("bikestore_users", JSON.stringify(users));
    }, [users]);
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem("bikestore_auth_user", JSON.stringify(currentUser));
        }
        else {
            localStorage.removeItem("bikestore_auth_user");
        }
    }, [currentUser]);
    const login = (email, _password) => {
        const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (found) {
            if (found.status === "Inactivo") {
                return { success: false, message: "Tu cuenta ha sido inactivada. Contacta al administrador." };
            }
            setCurrentUser(found);
            return { success: true, message: `Bienvenido de nuevo, ${found.name}`, user: found };
        }
        // Si el usuario no estaba en la lista, detectamos automáticamente su rol
        const isAutoAdmin = email.toLowerCase().includes("admin") || email.toLowerCase().includes("a.silva") || email.toLowerCase().includes("jafet");
        const defaultRole = isAutoAdmin ? "admin" : "cliente";
        const newUser = {
            id: Date.now(),
            name: email.split("@")[0].toUpperCase(),
            email,
            role: defaultRole,
            status: "Activo",
            createdAt: new Date().toISOString().split("T")[0],
        };
        setUsers((prev) => [...prev, newUser]);
        setCurrentUser(newUser);
        return { success: true, message: `Sesión iniciada con éxito (${defaultRole === "admin" ? "Administrador" : "Cliente"})`, user: newUser };
    };
    const logout = () => {
        setCurrentUser(null);
    };
    const register = (name, email) => {
        const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
        if (exists) {
            return { success: false, message: "Este correo ya se encuentra registrado." };
        }
        const newUser = {
            id: Date.now(),
            name,
            email,
            role: "cliente",
            status: "Activo",
            createdAt: new Date().toISOString().split("T")[0],
        };
        setUsers((prev) => [...prev, newUser]);
        setCurrentUser(newUser);
        return { success: true, message: "Cuenta creada exitosamente." };
    };
    const addUser = (userData) => {
        const exists = users.some((u) => u.email.toLowerCase() === userData.email.toLowerCase());
        if (exists) {
            return { success: false, message: "Ya existe un usuario con este correo electrónico." };
        }
        const newUser = {
            ...userData,
            id: Date.now(),
            createdAt: new Date().toISOString().split("T")[0],
        };
        setUsers((prev) => [...prev, newUser]);
        return { success: true, message: "Usuario creado exitosamente." };
    };
    const updateUser = (id, data) => {
        // Regla de negocio CU-16: Debe existir al menos un Administrador activo
        if (data.role === "cliente" || data.status === "Inactivo") {
            const target = users.find((u) => u.id === id);
            if (target && target.role === "admin" && target.status === "Activo") {
                const activeAdmins = users.filter((u) => u.role === "admin" && u.status === "Activo");
                if (activeAdmins.length <= 1) {
                    return {
                        success: false,
                        message: "Regla de seguridad: Debe existir siempre al menos un Administrador activo en el sistema.",
                    };
                }
            }
        }
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
        if (currentUser && currentUser.id === id) {
            setCurrentUser((prev) => (prev ? { ...prev, ...data } : null));
        }
        return { success: true, message: "Usuario actualizado exitosamente." };
    };
    const deactivateUser = (id) => {
        const target = users.find((u) => u.id === id);
        if (!target)
            return { success: false, message: "Usuario no encontrado." };
        if (target.role === "admin" && target.status === "Activo") {
            const activeAdmins = users.filter((u) => u.role === "admin" && u.status === "Activo");
            if (activeAdmins.length <= 1) {
                return {
                    success: false,
                    message: "No se puede inactivar: El sistema debe mantener al menos un administrador activo.",
                };
            }
        }
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: "Inactivo" } : u)));
        return { success: true, message: `Usuario ${target.name} inactivado con éxito.` };
    };
    return (<AuthContext.Provider value={{
            currentUser,
            users,
            login,
            logout,
            register,
            addUser,
            updateUser,
            deactivateUser,
        }}>
      {children}
    </AuthContext.Provider>);
};
