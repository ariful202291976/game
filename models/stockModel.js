const axios = require("axios");
const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

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

    // console.log(`API response for ${ticker}:`, response.data);

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

/**
 * Updates the user's cash balance.
 * @param {string} userId - The ID of the user.
 * @param {number} amount - The amount to add/subtract from the user's cash.
 * @returns {Promise<Object|null>} - The updated user document or null if not found.
 */
async function updateCash(userId, amount) {
  const db = getDB();
  const result = await db
    .collection("users")
    .findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $inc: { cash: amount } },
      { returnOriginal: false }
    );
  return result.value;
}

/**
 * Adds or updates a stock in the user's portfolio.
 * @param {string} userId - The ID of the user.
 * @param {string} ticker - The stock ticker.
 * @param {number} quantity - The quantity of stocks to add.
 * @param {number} price - The price at which the stocks were purchased.
 * @returns {Promise<Object|null>} - The updated user document or null if not found.
 */
async function addOrUpdateStockModel(userId, ticker, price, quantity) {
  const db = getDB();
  const totalPrice = price * quantity;
  // console.log("Total Price:", totalPrice);

  // Fetch the user document
  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(userId) });
  if (!user) throw new Error("User not found");

  // Check if the user has enough cash
  if (user.cash < totalPrice) {
    throw new Error("Insufficient funds to complete the purchase");
  }

  // Deduct the total price from the user's cash
  const updatedCash = user.cash - totalPrice;

  // Check if the stock already exists in the user's portfolio
  const stockIndex = user.stocks?.findIndex((stock) => stock.ticker === ticker);

  if (stockIndex >= 0) {
    // Update existing stock
    const existingStock = user.stocks[stockIndex];
    const totalQuantity = existingStock.quantity + quantity;
    const newAveragePrice =
      (existingStock.averagePrice * existingStock.quantity + price * quantity) /
      totalQuantity;

    user.stocks[stockIndex].quantity = totalQuantity;
    user.stocks[stockIndex].averagePrice = newAveragePrice;
    user.stocks[stockIndex].status = true;
  } else {
    // Add new stock to the portfolio
    if (!user.stocks) user.stocks = [];
    user.stocks.push({
      ticker,
      quantity,
      averagePrice: price,
    });
  }

  // Update the user's document in the database
  const result = await db.collection("users").findOneAndUpdate(
    { _id: new ObjectId(userId) },
    {
      $set: {
        stocks: user.stocks,
        cash: updatedCash, // Update user's cash
      },
    },
    { returnOriginal: false }
  );

  return result.value;
}

// Function to process selling stock from user's portfolio
async function processSellStockModel(userId, ticker, quantityToSell) {
  const db = getDB();

  // Fetch user data from DB
  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(userId) });
  if (!user) throw new Error("User not found");

  // Fetch the updated stock price
  const updatedPrice = await getStockPrice(ticker);
  console.log("updatedPrice", updatedPrice);
  if (!updatedPrice) throw new Error("Unable to fetch updated stock price");

  // Find the stock in the user's portfolio
  const stockIndex = user.stocks.findIndex((stock) => stock.ticker === ticker);
  if (stockIndex === -1) throw new Error("Stock not found in portfolio");

  const stock = user.stocks[stockIndex];
  if (stock.quantity < quantityToSell) {
    throw new Error("Not enough stock to sell");
  }

  // Calculate the total sale amount
  const totalSaleAmount = updatedPrice * quantityToSell;

  // Update stock quantity in portfolio
  stock.quantity -= quantityToSell;

  // Remove stock if quantity reaches zero
  if (stock.quantity === 0) {
    user.stocks.splice(stockIndex, 1);
  }

  // Update user's cash balance by adding the sale amount
  user.cash += totalSaleAmount;

  // Update the user's document in the database
  const updatedUser = await db.collection("users").findOneAndUpdate(
    { _id: new ObjectId(userId) },
    {
      $set: {
        stocks: user.stocks,
        cash: user.cash, // Update user's cash
      },
    },
    { returnOriginal: false }
  );

  return updatedUser.value; // Return the updated user document
}

module.exports = {
  getStockPrice,
  getAllStocks,
  getAllStocksWithPrices,
  addOrUpdateStockModel,
  processSellStockModel,
};
