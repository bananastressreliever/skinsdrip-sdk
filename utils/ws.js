import { WebSocket } from 'ws'
import EventEmitter from "eventemitter2"

import injector from './injector.js'

export default class WS extends EventEmitter {
    constructor(cookie) {

        super({
            wildcard: true
        })

        this.baseUrl = "wss://api.skinsdrip.com"
        this.cookie = cookie
        this.ws = false;

        this.isConnected = false;

        this.init()

        this.retryInterval = 7500;
        this.pingInterval = 7000;

        // Timeout and interval IDs

        this.retryTimeoutId = null;
        this.pingIntervalId = null;

    }

    init = () => {
        if (!this.cookie) throw new Error("Cookie is required");

        this.connect()

    }

    setupWebSocketEvents = () => {

        this.ws.on('open', () => {
            console.log("Connected to the Skinsdrip wss server");
            this.isConnected = true;

            // Clear any existing ping interval
            if (this.pingIntervalId) {
                clearInterval(this.pingIntervalId);
            }

            // Send a ping message every 7 seconds
            this.pingIntervalId = setInterval(() => {
                if (this.ws && this.isConnected) {
                    this.ws.send('ping');
                }
            }, this.pingInterval);
        });

        this.ws.on('message', (buffer) => {
            const dataStr = buffer?.toString(); // Convert buffer to string
            let data;
            try {
                data = JSON.parse(dataStr || '{}');
            } catch (error) {
                console.log("ERROR PARSING MESSAGE", error);
                return;
            }

            const event = data?.event;

            if (event?.includes("merchant")) data.event = event?.split('merchant:')?.[1];

            if (event?.includes("trade:update")) {
                try {
                    const orderId = data.data.orderId;
                    injector.removePendingCallback(orderId);
                } catch (error) {
                    console.log("ERROR remove pending callback", error);
                }
            }

            this.emit(data.event, data);
        });

        this.ws.on('close', () => {
            console.log('disconnected from the Skinsdrip wss server');
            this.isConnected = false;

            // Clear any existing retry timeout
            if (this.retryTimeoutId) {
                clearTimeout(this.retryTimeoutId);
            }

            // Clear any existing ping interval
            if (this.pingIntervalId) {
                clearInterval(this.pingIntervalId);
            }

            // Try to reconnect after a delay
            this.retryTimeoutId = setTimeout(this.connect, this.retryInterval);
        });
    };

    connect = () => {
        if (!this.isConnected || !this.ws) {
            try {
                this.ws = new WebSocket(this.baseUrl, {
                    headers: {
                        'Cookie': `auth=${this.cookie}`
                    }
                });
                this.setupWebSocketEvents();
            } catch (error) {
                console.log("ERROR CONNECTING TO WS", error);

                // Clear any existing retry timeout
                if (this.retryTimeoutId) {
                    clearTimeout(this.retryTimeoutId);
                }

                // Try to reconnect after a delay
                this.retryTimeoutId = setTimeout(this.connect, this.retryInterval);
            }
        }
    };

}