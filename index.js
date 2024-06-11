import api from "./utils/api.js";
import WS from "./utils/ws.js";
import utils from "./utils/utils.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

import injector from "./utils/injector.js";

/**
 * Represents the SKINSDRIP SDK.
 *
 * To use this SDK, you first need to authenticate using your merchant ID and secret.
 * After successful authentication, you can use the subscribe function or any other methods provided by the SDK.
 *
 * @class
 */
export default class SKINSDRIP_SDK {
	constructor(merchantId, merchantSecret, testmode = false) {
		this.merchantId = merchantId;
		this.merchantSecret = merchantSecret;
		this.testmode = testmode;

		this.ws = false;
		this.cookie = false; // if we are logged in

		this.#init();
	}

	#init = () => {
		if (!this.merchantId) throw new Error("Merchant ID is required");
		if (!this.merchantSecret) throw new Error("Merchant Secret is required");

		api.setAuthCredentials(this.merchantId, this.merchantSecret);
	};

	/**
	 * Authenticates the merchant by calling the API's authenticate method.
	 * @returns {Promise<{msg: string} | {error: boolean, msg: string, data: any}>} A promise that resolves to an object with a success message or an error object.
	 */
	authenticate = async () => {
		try {
			const cookieRes = await api.makeCall("POST", "/authenticate", {});
			const cookie = cookieRes?.data?.token;

			console.log(cookieRes, cookie, "SETTINGS COOKIES", );

			this.cookie = cookie;
			api.setCookie(cookie);

			return "Authenticated successfully";
		} catch (error) {
			console.log(error, "error in skinsdrip-sdk!");
			return {
				error: true,
				msg: error,
			};
		}
	};

	#checkAuthentication = () => {
		console.log(this.cookie, "CHECK AUTHENTICATION");
		if (!this.cookie) {

			console.log("TRYING TO REGENERATE COOKIE FOR SKINSDRIP SDK")
			this.authenticate();

			throw new Error("User is not authenticated. Please authenticate first.");
		}
	};

	/**
	 * Subscribes to an event and executes a callback function when the event occurs.
	 *
	 * @param {string} event - The event to subscribe to.
	 * @param {function} cb - The callback function to execute when the event occurs.
	 * @throws {Error} If event is not provided, callback is not a function, or cookie is not set.
	 */
	subscribe = (event, cb) => {
		if (!event) throw new Error("Event is required");
		if (typeof cb !== "function") throw new Error("Callback is required");
		if (!this.cookie)
			throw new Error("Cookie is required (authenticate first)");

		if (!this.ws) {
			this.ws = new WS(this.cookie);
		}

		this.ws.on(event, (data) => {
			cb(data);
		});
	};

	// Merchant methods

	/**
	 * Retrieves the pay session for a given user.
	 *
	 * @param {string} user_id - The ID of the user.
	 * @returns {Promise<Object>} - A promise that resolves to the pay session object.
	 */
	getPaySession = async (user_id) => {
		this.#checkAuthentication();

		return await api.makeCall("POST", "/get_session", {
			user_id,
			testmode: this.testmode,
		});
	};

	/**
	 * Retrieves the market data.
	 * @returns {Promise} A promise that resolves with the market data.
	 */
	getMarket = async () => {
		this.#checkAuthentication();

		return await api.makeCall("GET", "/market");
	};

	getBalance = async () => {
		this.#checkAuthentication();

		return await api.makeCall("GET", "/balance");
	};

	/**
	 * Retrieves the inventory using a GET request.
	 * @returns {Promise} A promise that resolves with the inventory data.
	 */
	getInventory = async (steamid) => {
		this.#checkAuthentication();

		return await api.makeCall("GET", "/inventory", { user_id: steamid });
	};

	/**
	 * Refreshes the inventory by making a POST request to '/inventory/refresh'.
	 * @returns {Promise} A promise that resolves when the request is completed.
	 */
	refreshInventory = async (steamid) => {
		this.#checkAuthentication();

		return await api.makeCall("GET", "/inventory/refresh", {
			user_id: steamid,
		});
	};

	/**
	 * Retrieves the withdrawal history.
	 * @returns {Promise<Object>} A promise that resolves to the withdrawal history.
	 */
	getHistory = async () => {
		this.#checkAuthentication();

		return await api.makeCall("POST", "/withdraw/history", {});
	};

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
	createTrade = async (steamid, tradeurl, userItems, botItems, callback) => {
		if (!steamid) throw new Error("Steamid is required");
		if (!tradeurl) throw new Error("Tradeurl is required");

		const tradeData = {
			user: {
				items: userItems,
				steamid,
				tradeurl,
			},
			botItems,
		};

		const tradeRes = await api.makeCall("POST", "/trading", { ...tradeData });

		if (tradeRes?.data?.orderId) {

			try {

				injector.pendingCallbacks[tradeRes.data.orderId] = callback || Date.now();

				setTimeout(async () => {
					if (injector.pendingCallbacks[tradeRes.data.orderId]) {
						

						this.#fetchPendingTrade(tradeRes.data.orderId, injector.pendingCallbacks[tradeRes.data.orderId]);

						delete injector.pendingCallbacks[tradeRes.data.orderId];
					}
				}, 1000 * 60 * 10);
			} catch (error) {
				console.log(error, "ERROR PENDING CALLBACKS")
			}

		}

		return tradeRes;
	};

	#fetchPendingTrade = async (orderId, callback) => {
		try {
			const pendingTrade = await api.makeCall("GET", "/trading/getOrder", {
				orderId,
			});

			console.log(pendingTrade, "PENDING TRADE");

			if(typeof callback === "function") callback(pendingTrade?.data);

			this.ws.emit("trade:update", {
				event: "trade:update",
				data: pendingTrade?.data,
			});
		} catch (error) { }
	};

	fetchOrders = async (orderIds) => {
		for (const orderId of orderIds) {
			await this.#fetchPendingTrade(orderId);
			await sleep(5000);
		}
	};
}

/**
 * Verifies the IPN (Instant Payment Notification) by comparing the provided signature with the calculated signature.
 * @param {Object} data - The IPN data object.
 * @param {string} secret - The secret key used for calculating the signature.
 * @returns {boolean} - Returns true if the provided signature matches the calculated signature, otherwise returns false.
 */
export const verifyIpn = (data, secret) => {
	const signature = data?.signature;
	const calculatedSignature = utils.createSignature(data, secret);

	return signature === calculatedSignature;
};
