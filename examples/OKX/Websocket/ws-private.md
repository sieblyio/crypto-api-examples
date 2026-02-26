Connecting to OKX's WebSocket streams is straightforward with the WebsocketClient.

- Install the OKX JavaScript SDK via NPM: `npm install okx-api`.
- Import the WebsocketClient (General WebSocket wrapper for all available OKX WebSocket streams)
- Create an instance of the WebsocketClient (API credentials not required unless you want to consume private topics).
- Configure event handlers for the emitted events you are interested in. The minimum recommended handlers are 'exception', 'update' and 'reconnected'. The latter informs you if a connection dropped and was successfully re-established by the client.
- Call the subscribe method for the desired channels and handle incoming events.

In this example, we demonstrate how you can easily subscribe to one or more available channels via the instanced WebsocketClient across all available topics and product groups.

This setup allows you to receive real-time updates on any activity on the exchange, a much faster alternative to polling REST endpoints for the same data.

The WebsocketClient handles most of the complexity for you:

- Automatically opens connections to Bybit's WebSocket streams.
- Automatically authenticates as needed.
- Tracks the topics you've subscribed to.
- Automatically detects if a connected stream becomes faulty.
- Automatically tears down the faulty stream, before replacing it with a fresh connection and automatically resubscribing to the topics you were subscribed to before.
