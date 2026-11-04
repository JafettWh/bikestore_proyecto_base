import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import "../assets/styles.css";
export const MainLayout = ({ currentPage, onNavigate, onOpenSearch, children, }) => {
    const isMinimalLayout = currentPage === "admin" || currentPage === "success";
    return (<div className="main-layout-div-1">
      {/* Header global (excepto en panel admin para mantener layout tipo dashboard) */}
      {currentPage !== "admin" && (<Header currentPage={currentPage} onNavigate={onNavigate} onOpenSearch={onOpenSearch}/>)}

      {/* Contenido de la página */}
      <div className="main-layout-div-2">{children}</div>

      {/* Footer global */}
      {!isMinimalLayout && <Footer onNavigate={onNavigate}/>}
    </div>);
};
export default MainLayout;
