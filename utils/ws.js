import { WebSocket } from 'ws'
import EventEmitter from 'events'

export default class WS extends EventEmitter {
    constructor(cookie) {

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

            if (!this.isConnected) {
                this.ws = new WebSocket(this.baseUrl, {
                    headers: {
                        'Cookie': `auth=${this.cookie}`
                    }
                });
            }

            this.ws.on('open', () => {
                console.log("Connected to the Skinsdrip wss server");
                this.isConnected = true;
            });

            this.ws.on('message', (data) => {
                const event = data?.event;

                if (!event.includes("merchant")) return;

                // splice merchant from the event
                data.event = event.split(':')[1];

                // Emit the event
                this.emit(data.event, data);
            });

            this.ws.on('close', () => {
                console.log('disconnected');
                setTimeout(connect, 5000); // try to reconnect every 5 seconds
            });
        };

        connect();
    }

}