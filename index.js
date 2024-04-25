import api from "./utils/api.js"
import WS from "./utils/ws.js"

/**
 * Represents the SKINSDRIP SDK.
 * 
 * To use this SDK, you first need to authenticate using your merchant ID and secret.
 * After successful authentication, you can use the subscribe function or any other methods provided by the SDK.
 * 
 * @class
 */
export default class SKINSDRIP_SDK {
    constructor(merchantId, merchantSecret) {
        this.merchantId = merchantId;
        this.merchantSecret = merchantSecret;

        this.ws = false
        this.cookie = false // if we are logged in

        this.#init()

    }

    #init = () => {
        if (!this.merchantId) throw new Error("Merchant ID is required");
        if (!this.merchantSecret) throw new Error("Merchant Secret is required");

        api.setAuthCredentials(this.merchantId, this.merchantSecret)

    }

    /**
     * Authenticates the merchant by calling the API's authenticate method.
     * @returns {Promise<{msg: string} | {error: boolean, msg: string, data: any}>} A promise that resolves to an object with a success message or an error object.
     */
    autenticate = async () => {

        try {
            const cookieRes = await api.makeCall('POST', '/authenticate', {})
            const cookie = cookieRes?.data?.token;

            this.cookie = cookie
            api.setCookie(cookie)

            return {
                msg: "Authenticated successfully",
            }

        } catch (error) {
            return {
                error: true,
                msg: error,
            }
        }

    }

    #checkAuthentication = () => {
        if (!this.cookie) throw new Error("User is not authenticated. Please authenticate first.");
    }

    /**
     * Subscribes to an event and executes a callback function when the event occurs.
     *
     * @param {string} event - The event to subscribe to.
     * @param {function} cb - The callback function to execute when the event occurs.
     * @throws {Error} If event is not provided, callback is not a function, or cookie is not set.
     */
    subscribe = (event, cb) => {

        if (!event) throw new Error("Event is required");
        if (typeof cb !== 'function') throw new Error("Callback is required");
        if (!this.cookie) throw new Error("Cookie is required (authenticate first)");

        if (!this.ws) {
            this.ws = new WS(this.cookie)
        }

        this.ws.on(event, (data) => {
            cb(data)
        })
    }

    // Merchant methods

    /**
     * Retrieves the pay session for a given user.
     *
     * @param {string} user_id - The ID of the user.
     * @returns {Promise<Object>} - A promise that resolves to the pay session object.
     */
    getPaySession = async (user_id) => {
        this.#checkAuthentication()

        return await api.makeCall('POST', '/get_session', { user_id })
    }

    /**
     * Retrieves the market data.
     * @returns {Promise} A promise that resolves with the market data.
     */
    getMarket = async () => {

        this.#checkAuthentication()

        return await api.makeCall('GET', '/market')
    }

    getBalance = async () => {

        this.#checkAuthentication()

        return await api.makeCall('GET', '/balance')
    }

    /**
     * Retrieves the inventory using a GET request.
     * @returns {Promise} A promise that resolves with the inventory data.
     */
    getInventory = async (steamid) => {

        this.#checkAuthentication()

        return await api.makeCall('GET', '/inventory', { user_id: steamid })
    }

    /**
     * Refreshes the inventory by making a POST request to '/inventory/refresh'.
     * @returns {Promise} A promise that resolves when the request is completed.
     */
    refreshInventory = async (steamid) => {

        this.#checkAuthentication()

        return await api.makeCall('POST', '/inventory/refresh', { user_id: steamid })
    }

    /**
     * Retrieves the withdrawal history.
     * @returns {Promise<Object>} A promise that resolves to the withdrawal history.
     */
    getHistory = async () => {

        this.#checkAuthentication()

        return await api.makeCall('POST', '/withdraw/history', {})
    }

    /**
     * Creates a trade between a user and a bot.
     * 
     * @param {string} steamid - The Steam ID of the user.
     * @param {string} tradeurl - The trade URL of the user.
     * @param {Array} userItems - An array of items owned by the user.
     * @param {Array} botItems - An array of items owned by the bot.
     * @returns {Promise} A promise that resolves with the trade data, including an orderId to track the trade.
     * @throws {Error} If steamid or tradeurl is not provided.
     */
    createTrade = async (steamid, tradeurl, userItems, botItems) => {

        if (!steamid) throw new Error("Steamid is required")
        if (!tradeurl) throw new Error("Tradeurl is required")

        const tradeData = {
            user: {
                items: userItems,
                steamid,
                tradeurl
            },
            botItems,
        }

        return await api.makeCall('POST', '/trading', { ...tradeData })
    }

}