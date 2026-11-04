import React, { useState, useEffect } from "react";
import Icon from "./Icon";
import Button from "./Button";
import Input from "./Input";
import TermsModal from "./TermsModal";
import "../assets/styles.css";

export const UserFormModal = ({ isOpen, onClose, userToEdit, onSave }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("cliente");
  const [status, setStatus] = useState("Activo");
  const [error, setError] = useState("");

  // Estados para CU-15 (Crear Usuario)
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Estados para CU-16 (Editar Usuario)
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name || "");
      setEmail(userToEdit.email || "");
      setRole(userToEdit.role || "cliente");
      setStatus(userToEdit.status || "Activo");
      setNewPassword("");
      setConfirmNewPassword("");
    } else {
      setName("");
      setEmail("");
      setRole("cliente");
      setStatus("Activo");
      setPassword("");
      setConfirmPassword("");
      setAcceptedTerms(false);
    }
    setError("");
    setIsTermsOpen(false);
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  // Validaciones en tiempo real para CU-15 (Crear Usuario)
  const isCreation = !userToEdit;
  const isPasswordLongEnough = password.length >= 8;
  const doPasswordsMatch =
    password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const hasConfirmPasswordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  // Validaciones en tiempo real para CU-16 (Editar Usuario)
  const hasNewPasswordInput = newPassword.length > 0 || confirmNewPassword.length > 0;
  const isNewPasswordLongEnough = newPassword.length >= 8;
  const doNewPasswordsMatch =
    newPassword.length > 0 &&
    confirmNewPassword.length > 0 &&
    newPassword === confirmNewPassword;
  const hasNewPasswordMismatch =
    confirmNewPassword.length > 0 && newPassword !== confirmNewPassword;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Todos los campos obligatorios deben ser diligenciados.");
      return;
    }

    // Reglas de negocio y validaciones CU-15 (Creación)
    if (isCreation) {
      if (!password) {
        setError("La contraseña es obligatoria para crear un nuevo usuario (CU-15).");
        return;
      }
      if (password.length < 8) {
        setError("La contraseña debe tener un mínimo de 8 caracteres de seguridad.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden. Por favor verifícalas.");
        return;
      }
      if (!acceptedTerms) {
        setError("Debes aceptar los términos y condiciones de BikeStore para continuar.");
        return;
      }
    }

    // Reglas de negocio y validaciones CU-16 (Edición)
    if (!isCreation && hasNewPasswordInput) {
      if (newPassword.length < 8) {
        setError("La nueva contraseña debe tener mínimo 8 caracteres de seguridad.");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError("La confirmación de la nueva contraseña no coincide.");
        return;
      }
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      role,
      status,
      ...(isCreation
        ? { password, acceptedTerms: true }
        : hasNewPasswordInput && newPassword
        ? { password: newPassword }
        : {}),
    };

    onSave(payload);
    onClose();
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        className="user-form-modal-div-1"
        onClick={onClose}
      >
        <div
          className="user-form-modal-div-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header del modal */}
          <div className="user-form-modal-div-3">
            <h3 className="user-form-modal-h3-1">
              {userToEdit
                ? "Editar Usuario (CU-16)"
                : "Crear Nuevo Usuario (CU-15)"}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="user-form-modal-button-1"
              aria-label="Cerrar modal"
            >
              <Icon name="close" size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="user-form-modal-form-1">
            {error && <p className="user-form-modal-p-1">{error}</p>}

            <Input
              label="Nombre Completo"
              required
              placeholder="Ej. Andrés Moncada"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="Correo Electrónico"
              type="email"
              required
              placeholder="andres@bikestore.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="user-form-modal-div-4">
              <div className="user-form-modal-div-5">
                <label className="user-form-modal-label-1">
                  Rol del Sistema *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="user-form-modal-select-1"
                >
                  <option value="cliente">Cliente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="user-form-modal-div-5">
                <label className="user-form-modal-label-1">
                  Estado de la Cuenta *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="user-form-modal-select-1"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            {/* SECCIÓN 1: CU-15 - CREAR NUEVO USUARIO (Contraseña y Confirmación Obligatorias) */}
            {isCreation && (
              <div className="user-form-modal-security-box">
                <div className="user-form-modal-security-header">
                  <Icon name="lock" size={14} />
                  <span>Credenciales de Acceso Seguro (CU-15)</span>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <Input
                      label="Contraseña"
                      type="password"
                      required
                      placeholder="Mínimo 8 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      error={
                        password.length > 0 && !isPasswordLongEnough
                          ? "La contraseña debe tener mínimo 8 caracteres."
                          : undefined
                      }
                    />
                    {password.length > 0 && (
                      <div className="user-form-modal-validation-hint">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                            isPasswordLongEnough
                              ? "text-emerald-600"
                              : "text-amber-600"
                          }`}
                        >
                          <Icon
                            name={isPasswordLongEnough ? "check" : "alert-triangle"}
                            size={12}
                          />
                          {isPasswordLongEnough
                            ? "Cumple con la longitud mínima de seguridad"
                            : "Faltan caracteres para el mínimo de 8"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Input
                      label="Confirmar Contraseña"
                      type="password"
                      required
                      placeholder="Repite la contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      error={
                        hasConfirmPasswordMismatch
                          ? "Las contraseñas no coinciden."
                          : undefined
                      }
                    />
                    {confirmPassword.length > 0 && (
                      <div className="user-form-modal-validation-hint">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                            doPasswordsMatch
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          <Icon
                            name={doPasswordsMatch ? "check" : "close"}
                            size={12}
                          />
                          {doPasswordsMatch
                            ? "Las contraseñas coinciden correctamente"
                            : "Las contraseñas aún no coinciden"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* CASILLA DE TÉRMINOS Y CONDICIONES (CU-15) */}
                <div className="user-form-modal-terms-container">
                  <label className="user-form-modal-terms-label">
                    <input
                      type="checkbox"
                      id="terms-cu15-checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="user-form-modal-checkbox"
                    />
                    <span className="text-xs text-neutral-800 leading-tight">
                      Acepto los{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsTermsOpen(true);
                        }}
                        className="user-form-modal-terms-link"
                      >
                        términos y condiciones
                      </button>{" "}
                      específicos de BikeStore <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {!acceptedTerms && (
                    <span className="text-[10px] text-neutral-500 pl-6 block">
                      Obligatorio para habilitar la creación de la cuenta.
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* SECCIÓN 2: CU-16 - EDITAR USUARIO (Nueva Contraseña Opcional) */}
            {!isCreation && (
              <div className="user-form-modal-security-box">
                <div className="user-form-modal-security-header">
                  <Icon name="lock" size={14} />
                  <div>
                    <span>Actualización de Credenciales (CU-16)</span>
                    <p className="text-[10px] text-neutral-500 font-normal">
                      Opcional: Dejar en blanco si no deseas cambiar la contraseña actual.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <Input
                      label="Nueva Contraseña"
                      type="password"
                      placeholder="Dejar en blanco para mantener actual"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      error={
                        newPassword.length > 0 && !isNewPasswordLongEnough
                          ? "La nueva contraseña debe tener mínimo 8 caracteres."
                          : undefined
                      }
                    />
                    {newPassword.length > 0 && (
                      <div className="user-form-modal-validation-hint">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                            isNewPasswordLongEnough
                              ? "text-emerald-600"
                              : "text-amber-600"
                          }`}
                        >
                          <Icon
                            name={isNewPasswordLongEnough ? "check" : "alert-triangle"}
                            size={12}
                          />
                          {isNewPasswordLongEnough
                            ? "Cumple con el mínimo de 8 caracteres"
                            : "Mínimo 8 caracteres requeridos"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Input
                      label="Confirmar Nueva Contraseña"
                      type="password"
                      placeholder="Repite la nueva contraseña"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      error={
                        hasNewPasswordMismatch
                          ? "Las contraseñas no coinciden."
                          : undefined
                      }
                    />
                    {confirmNewPassword.length > 0 && (
                      <div className="user-form-modal-validation-hint">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                            doNewPasswordsMatch
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          <Icon
                            name={doNewPasswordsMatch ? "check" : "close"}
                            size={12}
                          />
                          {doNewPasswordsMatch
                            ? "Las nuevas contraseñas coinciden"
                            : "La confirmación no coincide con la nueva contraseña"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="user-form-modal-div-6">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isCreation && !acceptedTerms}
              >
                {userToEdit ? "Guardar Cambios" : "Guardar Usuario"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal flotante de Términos y Condiciones */}
      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        onAccept={() => setAcceptedTerms(true)}
      />
    </>
  );
};

export default UserFormModal;
