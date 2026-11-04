import React from "react";
import Icon from "./Icon";
import "../assets/styles.css";
export const Toast = ({ message, type = "success", actionLabel, onAction, onClose, }) => {
    if (!message)
        return null;
    return (<div role="alert" className="toast-div-1 animate-bounce-short toast-div-style-1">
      <span className="toast-span-1">
        {type === "success" && <Icon name="check" size={15}/>}
        {type === "error" && <Icon name="alert-triangle" size={15}/>}
        {type === "info" && <Icon name="sparkles" size={15}/>}
      </span>

      <span className="toast-span-2">{message}</span>

      {actionLabel && onAction && (<button type="button" onClick={onAction} className="toast-button-1">
          {actionLabel}
        </button>)}

      {onClose && (<button type="button" onClick={onClose} aria-label="Cerrar alerta" className="toast-button-2">
          <Icon name="close" size={14}/>
        </button>)}
    </div>);
};
export default Toast;
