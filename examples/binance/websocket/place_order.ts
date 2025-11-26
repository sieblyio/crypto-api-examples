/**
 * @title Place a Spot Order on Binance
 * @description Example showing how to place a spot order using the Quantapi.io SDK
 * @category spot
 * @tags orders,trading
 */

import { MainClient } from "binance";

async function placeSpotOrder() {
    const client = new MainClient({
        api_key: "your-api-key",
        api_secret: "your-api-secret",
    });

    console.log("Order placed:");
}
