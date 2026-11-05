import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import Icon from "../components/Icon";
import Button from "../components/Button";
import Input from "../components/Input";
import TermsModal from "../components/TermsModal";
import { apiRequest } from "../utils/api";
import "../assets/styles.css";

export const AuthPage = ({ mode, onNavigate, returnAfterAuth }) => {
  const { login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!email.trim() || !password) {
      setError("Por favor completa tu correo y contraseña.");
      return;
    }
    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    setSuccessMsg(result.message);
    if (returnAfterAuth) onNavigate(returnAfterAuth);
    else onNavigate(result.user?.role === "admin" ? "admin" : "home");
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!name.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      setError("Completa todos los campos obligatorios.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener mínimo 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!acceptedTerms) {
      setError("Debes aceptar los términos y condiciones de BikeStore para registrarte.");
      return;
    }
    setIsSubmitting(true);
    const result = await register(name.trim(), email.trim(), password, phone.trim(), acceptedTerms);
    setIsSubmitting(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    setSuccessMsg(result.message);
    setTimeout(() => onNavigate("login"), 900);
  };

  const requestRecovery = async () => {
    setError("");
    setSuccessMsg("");
    if (!email.trim()) {
      setError("Ingresa el correo asociado a tu cuenta.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { message } = await apiRequest("/auth/password/forgot", {
        method: "POST",
        body: { email },
      });
      setSuccessMsg(message);
      setRecoveryStep(2);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyRecovery = async () => {
    setError("");
    setSuccessMsg("");
    setIsSubmitting(true);
    try {
      const { resetToken: verifiedToken } = await apiRequest("/auth/password/verify", {
        method: "POST",
        body: { email, code: recoveryCode },
      });
      setResetToken(verifiedToken);
      setRecoveryStep(3);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeRecovery = async () => {
    setError("");
    if (newPassword.length < 8) {
      setError("La contraseña debe tener mínimo 8 caracteres.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { message } = await apiRequest("/auth/password/reset", {
        method: "POST",
        body: { resetToken, password: newPassword },
      });
      setSuccessMsg(message);
      setTimeout(() => onNavigate("login"), 900);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRegister = mode === "register";

  if (mode === "recovery") {
    return (
      <main className="auth-main-1">
        <div className="auth-div-1">
          <div className="auth-div-2">
            <span className="auth-span-1">Seguridad de Cuenta</span>
            <h1 className="auth-h1-1">Recuperación de Contraseña</h1>
            <p className="auth-p-1">
              Solicita un código, confírmalo y define una contraseña nueva.
            </p>
          </div>
          <div className="auth-div-3" aria-label={`Paso ${recoveryStep} de 3`}>
            <div className="auth-div-4">
              <span className="auth-span-2">Paso {recoveryStep} de 3</span>
              <span className="auth-span-3">
                {["Solicitar código", "Confirmar código", "Nueva contraseña"][recoveryStep - 1]}
              </span>
            </div>
            <div className="auth-div-5" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={recoveryStep}>
              {[1, 2, 3].map((step) => (
                <span key={step} className={`auth-span-4 ${step <= recoveryStep ? "auth-span-5" : "auth-span-6"}`} />
              ))}
            </div>
          </div>
          <div className="auth-div-6">
            {error && <div className="auth-div-10" role="alert">{error}</div>}
            {successMsg && <div className="auth-div-11" role="status">{successMsg}</div>}
            {recoveryStep === 1 && (
              <div className="auth-div-7">
                <div className="auth-div-8">
                  <span className="auth-span-7">01</span>
                  <h2 className="auth-h2-1">Solicitar Código</h2>
                  <p className="auth-p-1">Te enviaremos un código temporal a tu correo.</p>
                </div>
                <Input label="Correo Registrado" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                <Button type="button" variant="primary" size="md" fullWidth disabled={isSubmitting} onClick={requestRecovery}>
                  {isSubmitting ? "Enviando..." : "Enviar Código"}
                </Button>
              </div>
            )}
            {recoveryStep === 2 && (
              <div className="auth-div-7">
                <div className="auth-div-8">
                  <span className="auth-span-7">02</span>
                  <h2 className="auth-h2-1">Confirmar Código</h2>
                  <p className="auth-p-1">El código vence en 15 minutos.</p>
                </div>
                <Input label="Código de Seguridad" inputMode="numeric" maxLength={6} required value={recoveryCode} onChange={(event) => setRecoveryCode(event.target.value.replace(/\D/g, ""))} />
                <div className="auth-div-3">
                  <Button type="button" variant="primary" size="md" fullWidth disabled={isSubmitting} onClick={verifyRecovery}>
                    Verificar Código
                  </Button>
                  <Button type="button" variant="outline" size="md" fullWidth disabled={isSubmitting} className="auth-button-1" onClick={requestRecovery}>
                    Reenviar código
                  </Button>
                </div>
              </div>
            )}
            {recoveryStep === 3 && (
              <div className="auth-div-7">
                <div className="auth-div-8">
                  <span className="auth-span-7">03</span>
                  <h2 className="auth-h2-1">Nueva Contraseña</h2>
                  <p className="auth-p-1">Debe tener al menos 8 caracteres y ser diferente a la actual.</p>
                </div>
                <Input label="Nueva Contraseña" type="password" required autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
                <Input label="Confirmar Contraseña" type="password" required autoComplete="new-password" value={confirmNewPassword} onChange={(event) => setConfirmNewPassword(event.target.value)} />
                <Button type="button" variant="primary" size="md" fullWidth disabled={isSubmitting} onClick={completeRecovery}>
                  {isSubmitting ? "Actualizando..." : "Actualizar Contraseña"}
                </Button>
              </div>
            )}
          </div>
          <div className="auth-div-16">
            ¿Recordaste tu contraseña?{" "}
            <button type="button" onClick={() => onNavigate("login")} className="auth-button-4">Inicia sesión aquí</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-main-2">
      <div className="auth-div-9">
        <span className="auth-span-8">{isRegister ? "Comunidad Ciclista" : "Acceso Seguro"}</span>
        <h1 className="auth-h1-2">{isRegister ? "Crear Nueva Cuenta" : "Iniciar Sesión"}</h1>
        <p className="auth-p-2">
          {isRegister ? "Regístrate para acceder a las compras y al historial de pedidos." : "Ingresa con las credenciales de tu cuenta BikeStore."}
        </p>
        {error && <div className="auth-div-10" role="alert">{error}</div>}
        {successMsg && <div className="auth-div-11" role="status">{successMsg}</div>}

        <form onSubmit={isRegister ? handleRegister : handleLogin} className="auth-form-1">
          {isRegister && (
            <>
              <Input label="Nombre Completo" required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
              <Input label="Teléfono Móvil / WhatsApp" type="tel" required autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </>
          )}
          <Input label="Correo Electrónico" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input label="Contraseña" type="password" required autoComplete={isRegister ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} error={isRegister && password.length > 0 && password.length < 8 ? "Mínimo 8 caracteres." : undefined} />
          {isRegister && (
            <>
              <Input label="Confirmar Contraseña" type="password" required autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} error={confirmPassword.length > 0 && password !== confirmPassword ? "Las contraseñas no coinciden." : undefined} />
              <div className="auth-terms">
                <label className="auth-terms-label">
                  <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} />
                  <span>Acepto los términos y condiciones de BikeStore *</span>
                </label>
                <button type="button" onClick={() => setIsTermsOpen(true)} className="auth-button-4">Leer términos y condiciones</button>
              </div>
            </>
          )}
          {!isRegister && (
            <div className="auth-div-12">
              <button type="button" onClick={() => onNavigate("recovery")} className="auth-button-2">¿Olvidaste tu contraseña?</button>
            </div>
          )}
          <Button type="submit" variant="primary" size="md" fullWidth className="auth-button-3" disabled={isSubmitting || (isRegister && !acceptedTerms)} icon={<Icon name="arrow" size={16} />}>
            {isSubmitting ? "Procesando..." : isRegister ? "Registrar Mi Cuenta" : "Ingresar a la Plataforma"}
          </Button>
        </form>

        <div className="auth-div-16">
          {isRegister ? (
            <>¿Ya tienes una cuenta registrada?{" "}
              <button type="button" onClick={() => onNavigate("login")} className="auth-button-4">Inicia sesión aquí</button>
            </>
          ) : (
            <>¿Aún no eres miembro de BikeStore?{" "}
              <button type="button" onClick={() => onNavigate("register")} className="auth-button-4">Regístrate ahora</button>
            </>
          )}
        </div>
      </div>
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} onAccept={() => setAcceptedTerms(true)} />
    </main>
  );
};

export default AuthPage;
