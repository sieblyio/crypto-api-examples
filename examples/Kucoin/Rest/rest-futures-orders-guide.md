Easily start working the Kucoin REST APIs in JavaScript.

- Install the Kucoin JavaScript SDK via NPM: `npm install kucoin-api`.
- Import the FuturesClient class (REST API wrapper for Kucoin futures endpoints). 
  - Note: If spot is preferred, use the SpotClient class intead.
- Create an authenticated FuturesClient instance with your API credentials.
- Call REST API methods as functions and await their responses.

In this example, we:

- Fetch contract metadata for `XRPUSDTM` and read the `multiplier`.
- Demonstrate how contract multiplier affects position sizing calculations.
- Provide practical order payload examples for market and limit long/short entries.
- Provide practical order payload examples for market and limit close-position requests.
- Provide practical order payload examples for stop-loss style close orders.

This script is designed as a practical futures order guide, showing how to structure different order requests and reason about contract size before submitting live orders.

For a full map of available REST API methods, check out the endpoint reference below.
