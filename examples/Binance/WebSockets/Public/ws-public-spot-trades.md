Connecting to Binance's WebSocket streams is straightforward with the WebsocketClient.

- Import the WebsocketClient (General WebSocket wrapper for all available Binance WebSocket streams)
- Create an instance of the WebsocketClient (API credentials not required unless you want to consume private topics).
- Configure event handlers for the emitted events you are interested in. The minimum recommended handlers are 'exception', 'message' and 'reconnected'. The latter informs you if a connection dropped and was successfully re-established by the client.
- Call the subscribe method for the desired channels and handle incoming events.

In this example, we:

- Subscribe to the spot trades streams for 3 symbols.
- Log incoming messages to the console for demonstration purposes.
- Use the "formattedMessage" event handler to log a more readable version of the incoming trade data (available thanks to the "beautify: true" configuration).

This setup allows you to receive real-time updates on market activity, a much faster alternative to polling REST endpoints for the same data.
