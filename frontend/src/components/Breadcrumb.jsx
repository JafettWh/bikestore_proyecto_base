import React from "react";
import "../assets/styles.css";
export const Breadcrumb = ({ items }) => {
    return (<nav aria-label="Ruta de navegación" className="breadcrumb-nav-1">
      {items.map((item, idx) => (<React.Fragment key={idx}>
          {idx > 0 && <span className="breadcrumb-span-1">/</span>}
          {item.active ? (<span className="breadcrumb-span-2">{item.label}</span>) : (<button type="button" onClick={item.onClick} className="breadcrumb-button-1">
              {item.label}
            </button>)}
        </React.Fragment>))}
    </nav>);
};
export default Breadcrumb;
