Bybit's WebSocket API (WS-API) is a powerful tool to send commands over a persisted and pre-authenticated WebSocket connection, allowing for lower latency interactions with the exchange compared to REST API calls.

The WS-API supports a wide range of commands, including order submission and cancellation, making it ideal for latency sensitive integrations.

To use the WebSocket API:

- Import the dedicated WebsocketAPIClient (a specialised wrapper around the WebsocketClient)
- Create an instance of the WebsocketAPIClient with credentials.
- Call the dedicated functions to send WS-API commands and await the responses.

Note that:

- Authentication is automatic.
- Connectivity is persistent with automatic failover.
- All WS-API commands are wrapped in promises, allowing you to await individual Websocket API commands as if it were a REST API call.
