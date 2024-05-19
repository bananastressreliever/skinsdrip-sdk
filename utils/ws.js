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

    }

    init = () => {
        if (!this.cookie) throw new Error("Cookie is required");

        this.subscribe()

    }

    /**
     * Establishes a WebSocket connection and subscribes to events.
     */
    subscribe = () => {
        const retryInterval = 7500;
        const pingInterval = 7000;

        const connect = () => {
            console.log("Trying to connect to the Skinsdrip wss server...");

            if (!this.isConnected || !this.ws) {
                try {
                    this.ws = new WebSocket(this.baseUrl, {
                        headers: {
                            'Cookie': `auth=${this.cookie}`
                        }
                    });
                } catch (error) {
                    console.log("ERROR CONNECTING TO WS", error);
                    setTimeout(connect, retryInterval);
                    return;
                }
            }

            this.ws.on('open', () => {
                console.log("Connected to the Skinsdrip wss server");
                this.isConnected = true;

                // Send a ping message every 7 seconds
                setInterval(() => {
                    if (this.ws && this.isConnected) {
                        this.ws.send('ping');
                    }
                }, pingInterval);
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
                setTimeout(connect, retryInterval);
            });
        };

        connect();
    }

}