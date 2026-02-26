Gate's WebSocket API (WS-API) lets you send trading commands over a persistent authenticated WebSocket connection, reducing request overhead compared to repeatedly opening REST requests.

The SDK's WebsocketAPIClient wraps this with promise-based methods, so each command can be awaited similarly to a REST call.

To use the WebSocket API:

- Install the Gate JavaScript SDK via NPM: `npm install gateio-api`.
- Import the dedicated WebsocketAPIClient.
- Create an authenticated WebsocketAPIClient instance with your API credentials.
- Optionally pre-authenticate with `connectWSAPI()` to avoid cold-start latency.
- Call dedicated WS-API methods and await their responses.

In this example, we:

- Run spot WS-API commands for placing, cancelling, amending, and querying orders.
- Run futures WS-API commands for placing, batch placing, cancelling, amending, listing, and checking order status.
- Use `WS_KEY_MAP.perpFuturesUSDTV4` to route futures requests to the correct futures WS connection group.

Note that:

- Different futures product groups use different WS keys.
- Results are logged per operation with shared error handling around the full workflow.
