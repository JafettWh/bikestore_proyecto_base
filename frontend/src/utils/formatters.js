export const formatCOP = (value) => {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(value);
};
export const generateOrderId = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `BS-${year}${month}${day}-${randomSuffix}`;
};
export const generateBookingId = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `BK-${randomSuffix}`;
};
