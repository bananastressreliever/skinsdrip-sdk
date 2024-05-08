export default class SKINSDRIP_SDK {
    /**
     * Constructs the SKINSDRIP_SDK object.
     * @param {string} merchantId - The merchant ID.
     * @param {string} merchantSecret - The merchant secret key.
     * @param {boolean} [testmode] - Optional. If true, the SDK will run in test mode.
     */
    constructor(merchantId: string, merchantSecret: string, testmode?: boolean);

    /**
     * Authenticates the SDK with the Skinsdrip server.
     * @returns {Promise<string | { error: boolean, msg: any }>} - Returns a promise that resolves to a string or an error object.
     */
    authenticate(): Promise<string | { error: boolean, msg: any }>;

    /**
     * Subscribes to a Skinsdrip event.
     * @param {string} event - The name of the event.
     * @param {function} cb - The callback function to be called when the event occurs.
     */
    subscribe(event: string, cb: (data: any) => void): void;

    /**
     * Gets the pay session for a user.
     * @param {string} user_id - The user's ID.
     * @returns {Promise<any>} - Returns a promise that resolves to the pay session data.
     */
    getPaySession(user_id: string): Promise<any>;

    /**
     * Gets the market data.
     * @returns {Promise<any>} - Returns a promise that resolves to the market data.
     */
    getMarket(): Promise<any>;

    /**
     * Gets the balance.
     * @returns {Promise<any>} - Returns a promise that resolves to the balance data.
     */
    getBalance(): Promise<any>;

    /**
     * Gets the inventory for a user.
     * @param {string} steamid - The user's Steam ID.
     * @returns {Promise<any>} - Returns a promise that resolves to the inventory data.
     */
    getInventory(steamid: string): Promise<any>;

    /**
     * Refreshes the inventory for a user.
     * @param {string} steamid - The user's Steam ID.
     * @returns {Promise<any>} - Returns a promise that resolves to the refreshed inventory data.
     */
    refreshInventory(steamid: string): Promise<any>;

    /**
     * Gets the history.
     * @returns {Promise<any>} - Returns a promise that resolves to the history data.
     */
    getHistory(): Promise<any>;

    /**
     * Creates a trade.
     * @param {string} steamid - The user's Steam ID.
     * @param {string} tradeurl - The user's trade URL.
     * @param {any[]} userItems - The items the user is offering.
     * @param {any[]} botItems - The items the bot is offering.
     * @returns {Promise<any>} - Returns a promise that resolves to the trade data.
     */
    createTrade(steamid: string, tradeurl: string, userItems: any[], botItems: any[]): Promise<any>;

    /**
     * Fetches orders.
     * @param {string[]} orderIds - The IDs of the orders to fetch.
     * @returns {Promise<void>} - Returns a promise that resolves when the orders have been fetched.
     */
    fetchOrders(orderIds: string[]): Promise<void>;
}

/**
 * Verifies the IPN (Instant Payment Notification) by comparing the provided signature with the calculated signature.
 * @param {Object} data - The IPN data object.
 * @param {string} secret - The secret key used for calculating the signature.
 * @returns {boolean} - Returns true if the provided signature matches the calculated signature, otherwise returns false.
 */
export function verifyIpn(data: any, secret: string): boolean;