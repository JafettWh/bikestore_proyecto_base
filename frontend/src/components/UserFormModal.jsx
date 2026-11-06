import React, { useEffect, useState } from "react";
import Icon from "./Icon";
import Button from "./Button";
import Input from "./Input";
import "../assets/styles.css";

export const UserFormModal = ({ isOpen, onClose, userToEdit, onSave }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(userToEdit?.name || "");
    setEmail(userToEdit?.email || "");
    setRole(userToEdit?.role || "");
    setPassword("");
    setConfirmPassword("");
    setAdminPassword("");
    setError("");
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;
  const isCreation = !userToEdit;
  const requiresAdminPassword = role === "admin" && (!userToEdit || userToEdit.role !== "admin");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !role) {
      setError("Completa el nombre, el correo y el rol.");
      return;
    }
    if (isCreation && password.length < 8) {
      setError("La contraseña debe tener mínimo 8 caracteres.");
      return;
    }
    if (isCreation && password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (requiresAdminPassword && !adminPassword) {
      setError("Ingresa la contraseña de autorización para crear un administrador.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await onSave({
        name: name.trim(),
        email: email.trim(),
        role,
        ...(isCreation ? { password } : {}),
        ...(role === "admin" ? { adminPassword } : {}),
      });
      if (result !== true) {
        setError(result?.message || "No fue posible guardar el usuario.");
        return;
      }
      onClose();
    } catch (saveError) {
      setError(saveError.message || "No fue posible guardar el usuario.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" className="user-form-modal-div-1" onClick={onClose}>
      <div className="user-form-modal-div-2" onClick={(event) => event.stopPropagation()}>
        <div className="user-form-modal-div-3">
          <h3 className="user-form-modal-h3-1">
            {isCreation ? "Crear Nuevo Usuario" : "Editar Usuario"}
          </h3>
          <button type="button" onClick={onClose} className="user-form-modal-button-1" aria-label="Cerrar modal">
            <Icon name="close" size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="user-form-modal-form-1">
          {error && <p className="user-form-modal-p-1" role="alert">{error}</p>}
          <Input label="Nombre Completo" required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
          <Input label="Correo Electrónico" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <div className="user-form-modal-div-5">
            <label className="user-form-modal-label-1" htmlFor="admin-user-role">Rol del Sistema *</label>
            <select id="admin-user-role" required value={role} onChange={(event) => setRole(event.target.value)} className="user-form-modal-select-1">
              <option value="">Selecciona un rol</option>
              <option value="cliente">Cliente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          {requiresAdminPassword && (
            <Input label="Contraseña de autorización admin" type="password" required autoComplete="off" value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} />
          )}
          {isCreation && (
            <div className="user-form-modal-security-box">
              <div className="user-form-modal-security-header">
                <Icon name="lock" size={14} />
                <span>Credenciales de acceso</span>
              </div>
              <Input label="Contraseña" type="password" required autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
              <Input label="Confirmar Contraseña" type="password" required autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
            </div>
          )}
          <div className="user-form-modal-div-8">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
              {isSaving ? "Guardando..." : isCreation ? "Crear Usuario" : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
