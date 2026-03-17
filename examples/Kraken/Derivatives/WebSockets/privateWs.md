Connecting to Kraken Derivatives private WebSocket streams is straightforward with the `WebsocketClient`.

- Install the Kraken JavaScript SDK via NPM: `npm install @siebly/kraken-api`.
- Import the `WebsocketClient`, `WS_KEY_MAP`, and any typed topic helpers you want to use.
- Create an authenticated client instance with your Kraken futures API credentials.
- Configure event handlers for key lifecycle events such as `open`, `message`, `response`, `reconnecting`, `reconnected`, `close`, `exception`, and `authenticated`.
- Subscribe to private topics on the `derivativesPrivateV1` connection key for private derivatives topics. 
  - Spot is also available via the dedicated spot connection key.

In this example, we:

- Subscribe to private derivatives topics including `open_orders`, `open_orders_verbose`, `fills`, `balances`, `open_positions`, `account_log`, and `notifications_auth`.
- Show both typed topic request objects and simple topic-name subscriptions.
- Rely on the SDK to automatically fetch, cache, and sign the challenge parameters required for private derivatives subscriptions.
- Authentication is completely automatic with the provided API keys.
- If the connection drops or goes stale, the highly resilient WebsocketClient for Kraken will quickly detect any issues, respawn a replacement connection and resubscribe to the topics you were consuming before the drop.

This setup lets you monitor derivatives account activity in real time without polling the REST API for the same information.
