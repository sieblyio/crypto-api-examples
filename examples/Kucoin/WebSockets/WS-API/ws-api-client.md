Kucoin's WebSocket API (WS-API) lets you send trading commands over persistent authenticated WebSocket connections, reducing overhead compared to repeatedly opening REST requests.

The SDK's WebsocketAPIClient wraps this with promise-based methods so each command can be awaited similarly to a REST call.

To use the WebSocket API:

- Install the Kucoin JavaScript SDK via NPM: `npm install kucoin-api`.
- Import the dedicated WebsocketAPIClient.
- Create an authenticated WebsocketAPIClient instance with your API credentials.
- Optionally customize logging with the injected logger.
- Call dedicated WS-API helper methods and await each response.

In this example, we:

- Submit, sync-submit, modify, cancel, and query spot orders.
- Submit and cancel margin orders.
- Submit, cancel, batch-submit, and batch-cancel futures orders.

Note that:

- The script is a broad capability walkthrough and includes placeholder order IDs that should be replaced for live use.
- Operations are wrapped in independent `try/catch` blocks so each WS-API request can be tested separately.
