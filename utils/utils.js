import crypto from 'crypto';

const sha256 = (string) => {
    return crypto.createHash('sha256').update(string).digest('hex');
}

/**
 * Creates a signature string based on the provided data and secret.
 * @param {Object} data - The data object used to generate the signature.
 * @param {string} secret - The secret key used to generate the signature.
 * @returns {string} - The generated signature.
 */
const createSignature = (data, secret) => {

    if (!data || !secret) throw new Error("Data and secret are required");

    const signatureString = Object.keys(data || {})?.sort()?.reduce((acc, key) => {
        if (key === "signature" || typeof data[key] === "object") return acc
        return acc + data[key];
    }, '');
    return sha256(`${signatureString}${secret}`);
}

export default {
    createSignature
}