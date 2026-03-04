Easily start calling Coinbase Advanced Trade private REST APIs in JavaScript.

- Install the Coinbase JavaScript SDK via NPM: `npm install coinbase-api`.
- Import the CBAdvancedTradeClient class (REST API wrapper for Coinbase Advanced Trade APIs).
- Create an authenticated client with your API credentials.
- Call REST API methods as functions and await the promise containing the response.

This example uses `CBAdvancedTradeClient`, which wraps Coinbase's Advanced Trade REST API. The SDK also includes dedicated REST clients for other Coinbase API groups:

- `CBAdvancedTradeClient` - Coinbase Advanced Trade API
- `CBAppClient` - Coinbase App API
- `CBExchangeClient` - Coinbase Exchange API
- `CBInternationalClient` - Coinbase International Exchange API
- `CBPrimeClient` - Coinbase Prime API
- `CBCommerceClient` - Coinbase Commerce API

In this example, we:

- Create an authenticated Advanced Trade REST client.
- Submit a limit spot buy order for `BTC-USDT`.
- Submit a market spot sell order for `BTC-USDT`.
- Generate unique `client_order_id` values using the SDK helper.

The client supports both Coinbase key types (ED25519 and ECDSA), and automatically handles signing based on the credentials provided.

For a full map of available REST API methods, check out the endpoint reference below.
