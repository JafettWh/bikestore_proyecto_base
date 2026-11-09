import React from "react";
import "../assets/styles.css";
export const Button = ({ children, variant = "primary", size = "md", fullWidth = false, icon, iconPosition = "right", className = "", disabled, ...props }) => {
    const baseStyles = "button-base";
    const sizeStyles = {
        sm: "button-size-sm",
        md: "button-size-md",
        lg: "button-size-lg",
    };
    const variantStyles = {
        primary: "button-variant-primary",
        secondary: "button-variant-secondary",
        dark: "button-variant-dark",
        outline: "button-variant-outline",
        danger: "button-variant-danger",
        ghost: "button-variant-ghost",
    };
    return (<button className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${fullWidth ? "button-full-width" : ""}
        ${className}
      `} disabled={disabled} {...props}>
      {icon && iconPosition === "left" && <span className="button-span-1">{icon}</span>}
      {children}
      {icon && iconPosition === "right" && <span className="button-span-1">{icon}</span>}
    </button>);
};
export default Button;
