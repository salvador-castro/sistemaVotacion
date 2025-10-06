// lib/utils.js
export function formatDNI(dni) {
    return dni.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function getTimeRange(hour) {
    if (hour >= 8 && hour < 13) return 'mañana';
    if (hour >= 13 && hour < 18) return 'tarde';
    return 'noche';
}

export function validateExcelHeaders(headers) {
    const required = ['dni', 'nombre', 'apellido', 'especialidad'];
    return required.every(header => headers.includes(header));
}