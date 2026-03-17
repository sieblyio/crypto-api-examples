Easily start working with Kraken Derivatives REST APIs in JavaScript.

- Install the Kraken JavaScript SDK via NPM: `npm install @siebly/kraken-api`.
- Import the `DerivativesClient` class for Kraken futures and derivatives REST endpoints. 
  - If spot is preferred, import the `SpotClient`, which is the dedicated utility class wrapped around Kraken's Spot REST APIs.
- Create an authenticated `DerivativesClient` instance with your API credentials.
- Call REST API methods as functions and await their responses.

In this example, we:

- Edit an existing order by updating parameters such as the limit price.
- Cancel a single open order by `order_id`.
- Cancel all open orders on the account.
- Cancel all open orders for a specific symbol such as `PF_ETHUSD`.
- Demonstrate batch order management by combining edit and cancel actions in one request.

This script is designed as a practical order management walkthrough for Kraken Derivatives, showing common authenticated API calls in JavaScript and the shapes of the request payloads involved.

For a full map of available REST API methods, check out the endpoint reference below.
