const axios = require("axios");

// const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
const POLYGON_API_KEY = "eegavq5RrAwcZEvx4E__WGfRTMT7jOcc";

/**
 * Fetches all stocks from an external API (e.g., Polygon.io).
 * @returns {Promise<Array>} - An array of stock data from the API.
 */
async function getAllStocks() {
  try {
    const response = await axios.get(
      "https://api.polygon.io/v3/reference/tickers",
      {
        params: {
          apiKey: POLYGON_API_KEY,
          market: "stocks", // Filter for stocks only
          active: true, // Retrieve only active stocks
          limit: 8, // Retrieve 12 stocks
        },
      }
    );

    if (response.data && response.data.results) {
      return response.data.results; // Array of stock data
    } else {
      throw new Error("No stock data available from the API.");
    }
  } catch (error) {
    console.error("Error fetching stocks from API:", error.message);
    throw error;
  }
}

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

    console.log(`API response for ${ticker}:`, response.data);

    if (
      response.data &&
      response.data.results &&
      typeof response.data.results.p === "number"
    ) {
      return response.data.results.p; // Extract the price from the 'p' field
    } else {
      console.warn(`Price not found for ${ticker}`);
      return "N/A"; // Return 'N/A' if the price is not found
    }
  } catch (error) {
    console.error(`Error fetching price for ${ticker}:`, error.message);
    return "N/A"; // Return 'N/A' on error
  }
}

/**
 * Fetches all stocks along with their prices.
 * @returns {Promise<Array>} - Array of stocks with their prices.
 */
async function getAllStocksWithPrices() {
  try {
    const stocks = await getAllStocks(); // Fetch all stocks

    const stocksWithPrices = await Promise.all(
      stocks.map(async (stock) => {
        try {
          const price = await getStockPrice(stock.ticker);
          return { ...stock, price: price !== null ? price : "N/A" }; // Handle missing prices
        } catch (error) {
          console.error(
            `Failed to fetch price for ${stock.ticker}:`,
            error.message
          );
          return { ...stock, price: "N/A" }; // Set "N/A" for fetch errors
        }
      })
    );

    return stocksWithPrices;
  } catch (error) {
    console.error("Error fetching stocks with prices:", error.message);
    throw error;
  }
}

// async function getAllStocks() {
//   try {
//     const response = await axios.get(
//       "https://api.polygon.io/v3/reference/tickers",
//       {
//         params: {
//           apiKey: POLYGON_API_KEY,
//           market: "stocks", // Filter for stocks only
//           active: true, // Retrieve only active stocks
//           limit: 12, // Retrieve 20 stocks
//         },
//       }
//     );

//     if (response.data && response.data.results) {
//       // console.log(response.data.results);
//       return response.data.results; // Array of stock data
//     } else {
//       throw new Error("No stock data available from the API.");
//     }
//   } catch (error) {
//     console.error("Error fetching stocks from API:", error.message);
//     throw error;
//   }
// }

module.exports = {
  getStockPrice,
  getAllStocks,
  getAllStocksWithPrices,
};
