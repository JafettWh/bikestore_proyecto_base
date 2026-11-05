import { formatCOP } from "./formatters";
import { asset } from "../config/env";
async function logoImage() {
    const image = new Image();
    image.src = asset("/assets/logo.png");
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas.getContext("2d").drawImage(image, 0, 0);
    return { data: canvas.toDataURL("image/png"), ratio: canvas.width / canvas.height };
}
function chartImage(days) {
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 1000, 300);
    const max = Math.max(1, ...days.map((d) => d.total));
    const width = 920 / days.length;
    ctx.font = "14px sans-serif";
    days.forEach((d, i) => {
        const height = d.total / max * 220;
        ctx.fillStyle = "#ffd400";
        ctx.fillRect(40 + i * width, 250 - height, Math.max(2, width - 5), height);
        ctx.fillStyle = "#11120f";
        ctx.fillText(d.label, 40 + i * width, 275);
    });
    ctx.fillText(`Máximo diario: ${formatCOP(max === 1 ? 0 : max)} · Eje horizontal: día del mes`, 40, 20);
    return canvas.toDataURL("image/png");
}
async function pdfBase(title) {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const logo = await logoImage();
    doc.setFillColor(17, 18, 15);
    doc.rect(0, 0, 210, 35, "F");
    doc.addImage(logo.data, "PNG", 14, 5, 45, 45 / logo.ratio);
    doc.setTextColor(17, 18, 15);
    doc.setFontSize(18);
    doc.text(title, 14, 48);
    doc.setFontSize(10);
    let y = 59;
    const line = (text) => {
        const lines = doc.splitTextToSize(text, 180);
        for (const row of lines) {
            if (y > 275) {
                doc.addPage();
                y = 20;
            }
            doc.text(row, 14, y);
            y += 6;
        }
    };
    return { doc, line };
}
export async function downloadInvoice(record) {
    const { doc, line } = await pdfBase("Factura / comprobante de compra");
    line(`BikeStore · Palmira, Colombia · Referencia: ${record.id}`);
    line(`Fecha: ${record.date} · Estado: ${record.status}`);
    line(`Cliente: ${record.customerName}`);
    line(`Correo: ${record.email} · Teléfono: ${record.phone || "No registrado"}`);
    line(`Dirección: ${record.address} · ${record.city}`);
    line(`Método de pago: ${record.paymentMethod === "card" ? "Tarjeta" : record.paymentMethod.toUpperCase()}`);
    line("Detalle de productos (precios con IVA incluido):");
    record.items.forEach((item) => {
        line(`${item.name}${item.selectedSize ? ` · Talla ${item.selectedSize}` : ""}`);
        line(`${item.qty} x ${formatCOP(item.price)} = ${formatCOP(item.qty * item.price)}`);
    });
    const includedTax = Math.round(record.subtotal - record.subtotal / 1.19);
    line(`Base antes de IVA: ${formatCOP(record.subtotal - includedTax)}`);
    line(`IVA incluido (19%): ${formatCOP(includedTax)}`);
    line(`Subtotal: ${formatCOP(record.subtotal)}`);
    line(`Envío: ${formatCOP(record.shipping ?? record.total - record.subtotal)}`);
    line(`TOTAL: ${formatCOP(record.total)}`);
    line("Documento informativo. No constituye factura electrónica validada por la DIAN.");
    doc.save(`BikeStore-${record.id}.pdf`);
}
export async function exportReport(format, report) {
    const { period, section, sales, orderCount, averageOrder, topProducts, salesSeries, orderDetails } = report;
    const periodLabel = period.month
        ? `${String(period.month).padStart(2, "0")}/${period.year}`
        : String(period.year);
    const generatedAt = new Date();
    const generatedText = generatedAt.toLocaleString("es-CO");
    const chart = chartImage(salesSeries.map((point) => ({ label: point.label, total: point.sales })));
    const metrics = [
        ["Periodo", periodLabel],
        ["Categoría", section],
        ["Ventas de productos (COP, sin envío)", sales],
        ["Pedidos pagados", orderCount],
        ["Promedio por pedido (COP)", averageOrder],
        ["Generado", generatedText],
    ];
    if (format === "PDF") {
        const { doc, line } = await pdfBase("Resumen de métricas y rendimiento");
        metrics.forEach(([key, value]) => line(`${key}: ${value}`));
        line("Productos más vendidos:");
        topProducts.forEach((product, index) => line(`${index + 1}. ${product.name} · ${product.quantity} unidades · ${formatCOP(product.sales)}`));
        line("Ventas por día o mes (COP)");
        doc.addImage(chart, "PNG", 14, 140, 180, 54);
        doc.setFontSize(10);
        doc.text(`Generado: ${generatedText}`, 14, 205);
        doc.save(`BikeStore-reporte-${generatedAt.toISOString().slice(0, 10)}.pdf`);
        return;
    }
    const { Workbook } = await import("exceljs");
    const workbook = new Workbook();
    workbook.creator = "BikeStore";
    const sheet = workbook.addWorksheet("Resumen");
    sheet.columns = [{ width: 58 }, { width: 32 }];
    const logo = await logoImage();
    sheet.addImage(workbook.addImage({ base64: logo.data, extension: "png" }), {
        tl: { col: 0, row: 0 }, ext: { width: 200, height: 200 / logo.ratio },
    });
    sheet.getRow(1).height = Math.max(65, 150 / logo.ratio);
    sheet.addRow(["BIKESTORE · MÉTRICAS Y RENDIMIENTO"]);
    metrics.forEach((row) => sheet.addRow(row));
    sheet.addRow(["Valores de ventas calculados con pedidos pagados en MySQL"]);
    sheet.addRow([]);
    sheet.addRow(["Productos más vendidos", "Unidades", "Ventas COP"]);
    topProducts.forEach((product) => sheet.addRow([product.name, product.quantity, product.sales]));
    sheet.addImage(workbook.addImage({ base64: chart, extension: "png" }), {
        tl: { col: 0, row: 16 }, ext: { width: 700, height: 210 },
    });
    const daily = workbook.addWorksheet("Ventas por periodo");
    daily.addRow(["Día / mes", "Ventas COP"]);
    salesSeries.forEach((point) => daily.addRow([point.label, point.sales]));
    const detail = workbook.addWorksheet("Detalle de pedidos");
    detail.addRow(["Referencia", "Fecha", "Cliente", "Correo", "Producto", "Cantidad", "Precio unitario COP", "Sección", "Categoría", "Total línea COP"]);
    orderDetails.forEach((row) => detail.addRow([
        row.orderNumber,
        new Date(row.createdAt).toLocaleString("es-CO"),
        row.customerName,
        row.email,
        row.productName,
        Number(row.quantity),
        Number(row.unitPrice),
        row.section,
        row.category,
        Number(row.quantity) * Number(row.unitPrice),
    ]));
    workbook.eachSheet((s) => {
        if (s !== sheet)
            s.columns.forEach((c) => { c.width = 25; });
        const header = s.getRow(s === sheet ? 2 : 1);
        header.font = { bold: true, color: { argb: "FF11120F" } };
        header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFD400" } };
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const url = URL.createObjectURL(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `BikeStore-reporte-${generatedAt.toISOString().slice(0, 10)}.xlsx`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
