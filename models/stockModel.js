// models/stockModel.js

const { getDB } = require("../config/db");
const axios = require("axios");

const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

/**
 * Fetches the 15-minute delayed stock price from Polygon.io.
 * @param {string} ticker - The stock ticker symbol.
 * @returns {Promise<Object>} - Returns the latest stock price data.
 */
async function getStockPrice(ticker) {
  try {
    const response = await axios.get(
      `https://api.polygon.io/v2/last/trade/${ticker}`,
      {
        params: { apiKey: POLYGON_API_KEY },
      }
    );
    if (response.data && response.data.results) {
      const price = response.data.results.p;
      return { ticker, price, timestamp: response.data.results.t };
    } else {
      throw new Error(`No trade data available for ticker: ${ticker}`);
    }
  } catch (error) {
    console.error(`Error fetching stock price for ${ticker}:`, error.message);
    throw error;
  }
}

module.exports = { getStockPrice };
