import axios from 'axios'
import utils from './utils.js'

const baseUrl = "https://api.skinsdrip.com/merchant"

let merchantId = '';
let merchantSecret = '';
let cookie = '';

/**
 * Sets the authentication credentials for the merchant.
 *
 * @param {string} merchant - The merchant ID.
 * @param {string} secret - The merchant secret.
 * @throws {Error} If merchant ID or secret is missing.
 */
const setAuthCredentials = (merchant, secret) => {

    if (!merchant) throw new Error("Merchant ID is required");
    if (!secret) throw new Error("Merchant Secret is required");

    merchantId = merchant;
    merchantSecret = secret;
}

const setCookie = (token) => {
    cookie = token;
}

/**
 * Makes an API call with the specified parameters.
 *
 * @param {string} type - The HTTP method type (e.g., 'GET', 'POST', 'PUT', 'DELETE').
 * @param {string} url - The URL to make the API call to.
 * @param {Object} data - The data to send in the API call.
 * @param {string} merchantId - The merchant ID.
 * @param {string} merchantSecret - The merchant secret.
 * @returns {Promise<Object>} - A promise that resolves to the API response data.
 */
const makeCall = async (type, url, data) => {

    if (!merchantId) throw new Error("Merchant ID is required");
    if (!merchantSecret) throw new Error("Merchant Secret is required");

    const signature = utils.createSignature((data || {}), merchantSecret);

    const config = {
        method: type,
        maxBodyLength: Infinity,
        url: baseUrl + url,
        headers: {
            'merchant-id': merchantId,
            'Content-Type': 'application/json',
            'Cookie': `auth=${cookie}`
        },
        data: JSON.stringify({
            ...data,
            signature
        })
    };

    const res = await axios.request(config);
    if (res.data.error) throw { ...res?.data };

    return res.data

}

export default {
    makeCall,
    setAuthCredentials,
    setCookie
}