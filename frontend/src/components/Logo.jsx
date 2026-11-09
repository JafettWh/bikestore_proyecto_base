import React from "react";
import { asset } from "../config/env";
import "../assets/styles.css";
export const Logo = ({ onClick, size = "md", variant = "light", className = "", }) => {
    const heights = {
        sm: "logo-height-sm",
        md: "logo-height-md",
        lg: "logo-height-lg",
    };
    return (<button type="button" onClick={onClick} className={`logo-button-1 group ${className}`} aria-label="BikeStore - Ir al inicio">
      <img src={asset("/assets/logo.png")} alt="BikeStore" className={`${heights[size]} logo-img-1 logo-img-style-1`}/>
    </button>);
};
export default Logo;
