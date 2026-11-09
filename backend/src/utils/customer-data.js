const AppError = require('./AppError');
const colombiaLocations = require('../../../shared/colombia-locations.json');

const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;
const ADDRESS_PATTERN = /^[\p{L}\p{M}\p{N}\s#.,\-/'º°]+$/u;
const CITY_PATTERN = /^[\p{L}\p{M}\s().' -]+$/u;

function validateFullName(value) {
    const name = typeof value === 'string' ? value.trim() : '';
    if (name.length < 3 || name.length > 120 || !NAME_PATTERN.test(name)) {
        throw new AppError('El nombre debe tener entre 3 y 120 caracteres y contener solo letras, espacios, apóstrofes, puntos o guiones', 400);
    }
    return name;
}

function validatePhone(value, required = false) {
    if (value === undefined || value === null || value === '') {
        if (required) throw new AppError('Ingresa un teléfono móvil colombiano de 10 dígitos', 400);
        return null;
    }
    if (typeof value !== 'string') throw new AppError('El teléfono no es válido', 400);
    if (!value.trim()) {
        if (required) throw new AppError('Ingresa un teléfono móvil colombiano de 10 dígitos', 400);
        return null;
    }
    const phone = value.trim().replace(/[\s()-]/g, '');
    if (!/^3\d{9}$/.test(phone)) {
        throw new AppError('El teléfono móvil debe comenzar por 3 y tener 10 dígitos', 400);
    }
    return phone;
}

function optionalField(value, label, maxLength, pattern) {
    if (value === undefined || value === null || value === '') return '';
    if (typeof value !== 'string') throw new AppError(`${label} no es válido`, 400);
    const cleaned = value.trim();
    if (cleaned.length > maxLength || (cleaned && !pattern.test(cleaned))) {
        throw new AppError(`${label} supera la longitud permitida o contiene caracteres no válidos`, 400);
    }
    return cleaned;
}

function validateDeliveryAddress(data, { required = false, strictCity = false } = {}) {
    const address = optionalField(data.address, 'La dirección', 255, ADDRESS_PATTERN);
    const neighborhood = optionalField(data.neighborhood, 'El barrio o las indicaciones', 120, ADDRESS_PATTERN);
    const city = optionalField(data.city, 'La ciudad o municipio', 100, CITY_PATTERN);
    const department = optionalField(data.department, 'El departamento', 100, CITY_PATTERN);

    if (required && (!address || !city || !department)) {
        throw new AppError('La dirección, ciudad y departamento son obligatorios', 400);
    }
    if (address && address.length < 5) throw new AppError('La dirección debe tener al menos 5 caracteres', 400);
    if ((city && !department) || (department && !city)) {
        throw new AppError('Selecciona el departamento y la ciudad o municipio', 400);
    }
    if (department && !Object.hasOwn(colombiaLocations, department)) {
        throw new AppError('Selecciona un departamento válido de Colombia', 400);
    }
    if (strictCity && city && !colombiaLocations[department].includes(city)) {
        throw new AppError('Selecciona una ciudad o municipio válido para el departamento', 400);
    }

    return { address, neighborhood, city, department };
}

module.exports = { validateFullName, validatePhone, validateDeliveryAddress };
