import { WebSocket } from 'ws'
import EventEmitter from "eventemitter2"

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
        const connect = () => {

            console.log("Trying to connect to the Skinsdrip wss server...")

            if (!this.isConnected || !this.ws) {
                this.ws = new WebSocket(this.baseUrl, {
                    headers: {
                        'Cookie': `auth=${this.cookie}`
                    }
                });
            }

            this.ws.on('open', () => {
                console.log("Connected to the Skinsdrip wss server");
                this.isConnected = true;

                // Send a ping message every 7 seconds
                setInterval(() => {
                    if (this.ws && this.isConnected) {
                        this.ws.send('ping');
                    }
                }, 7000);
            });

            this.ws.on('message', (buffer) => {

                const dataStr = buffer?.toString(); // Convert buffer to string
                const data = JSON.parse(dataStr || {});

                const event = data?.event;

                if (event?.includes("merchant")) data.event = event?.split('merchant:')?.[1];

                this.emit(data.event, data);
            });

            this.ws.on('close', () => {
                console.log('disconnected from the Skinsdrip wss server');
                this.isConnected = false;
                setTimeout(connect, 7500); // try to reconnect every 5 seconds
            });
        };

        connect();
    }

}