import React, { useState } from "react";
import Icon from "./Icon";
import "../assets/styles.css";
export const Input = ({ label, error, helper, icon, className = "", id, type = "text", showTogglePassword = true, passwordHint = "Mínimo 8 caracteres", ...props }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === "password";
    const actualType = isPasswordField && showPassword ? "text" : type;
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    return (<div className="input-div-1">
      {label && (<div className="input-div-2">
          <label htmlFor={inputId} className="input-label-1">
            {label} {props.required && <span className="input-span-1">*</span>}
          </label>
          {isPasswordField && passwordHint && (<span className="input-span-2">
              ({passwordHint})
            </span>)}
        </div>)}

      <div className="input-div-3">
        {icon && (<span className="input-span-3">
            {icon}
          </span>)}

        <input id={inputId} type={actualType} style={{
            ...(props.style || {}),
            ...(icon ? { paddingLeft: "42px" } : {}),
            ...(isPasswordField && showTogglePassword ? { paddingRight: "44px" } : {}),
        }} className={` input-input-1 ${icon ? "input-input-2 !pl-[42px]" : ""}
            ${isPasswordField && showTogglePassword ? "input-input-3 !pr-[44px]" : ""}
            ${error ? "input-input-4" : "input-input-5"}
            ${className}
          `} {...props}/>

        {isPasswordField && showTogglePassword && (<button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1} aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"} className="input-button-1">
            <Icon name={showPassword ? "eye-off" : "eye"} size={17}/>
          </button>)}
      </div>

      {error && <span className="input-span-4">{error}</span>}
      {helper && !error && (<span className="input-span-5">{helper}</span>)}
    </div>);
};
export default Input;
