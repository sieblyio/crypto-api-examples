Easily start calling Bitmart's spot REST APIs in JavaScript.

- Install the Bitmart JavaScript SDK via NPM: `npm install bitmart-api`.
- Import the RestClient class (REST API wrapper for Bitmart APIs).
- Create an authenticated RestClient instance with your API credentials (`apiKey`, `apiSecret`, `apiMemo`).
- Call REST API methods as functions and await the promise containing the response.

In this example, we:

- Prepare an authenticated REST client using environment variables.
- Submit a spot market sell order on `BTC_USDT` using `submitSpotOrderV2`.
- Log the full API response to the console.

Commented examples are also included in the script to show how to prepare market and limit buy order payloads.

For a full map of available REST API methods, check out the endpoint reference below.
