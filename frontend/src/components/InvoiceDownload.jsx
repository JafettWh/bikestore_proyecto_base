import React, { useState } from "react";
import { downloadInvoice } from "../utils/documents";
import Button from "./Button";
import Icon from "./Icon";
import "../assets/styles.css";
export default function InvoiceDownload({ record }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    return (<div className="invoice-download-div-1">
      <Button variant="outline" disabled={busy} icon={<Icon name="download" size={16}/>} onClick={async () => {
            setBusy(true);
            setError("");
            try {
                await downloadInvoice(record);
            }
            catch {
                setError("No se pudo generar el documento. Intenta nuevamente.");
            }
            finally {
                setBusy(false);
            }
        }}>
        {busy ? "Generando PDF…" : "Descargar comprobante PDF"}
      </Button>
      {error && <div role="alert" className="invoice-download-div-2">{error}</div>}
    </div>);
}
