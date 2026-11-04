import React from "react";
import "../assets/styles.css";
export const Badge = ({ children, variant = "yellow", size = "md", className = "", }) => {
    const variantStyles = {
        yellow: "badge-variant-yellow",
        green: "badge-variant-green",
        red: "badge-variant-red",
        dark: "badge-variant-dark",
        outline: "badge-variant-outline",
        blue: "badge-variant-blue",
    };
    const sizeStyles = {
        sm: "badge-size-sm",
        md: "badge-size-md",
    };
    return (<span className={`badge-span-1 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>);
};
export default Badge;
