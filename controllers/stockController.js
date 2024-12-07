// const { updateCash, addTransaction } = require("../models/stockModel");
// const fetch = require("node-fetch");

// async function getCurrentPrice(ticker) {
//   const apiKey = process.env.POLYGON_API_KEY;
//   const url = `https://api.polygon.io/v2/last/trade/${ticker}?apiKey=${apiKey}`;
//   const response = await fetch(url);
//   const data = await response.json();
//   return data.results.p;
// }

// async function buyStock(req, res) {
//   const { ticker, quantity } = req.body;
//   const userId = req.session.user._id;

//   const price = await getCurrentPrice(ticker);
//   const cost = price * quantity;
//   await updateCash(userId, -cost);
//   await addTransaction(userId, ticker, quantity, price, "buy");
//   res.redirect("/portfolio");
// }

// module.exports = { buyStock, getCurrentPrice };

const {
  getAllStocks,
  getAllStocksWithPrices,
  addOrUpdateStockModel,
  processSellStockModel,
} = require("../models/stockModel");

// async function fetchAllStocks(req, res) {
//   try {
//     const stocks = await getAllStocks(); // Fetch stocks from the model

//     res.render("marketplace", { stocks });
//   } catch (error) {
//     console.error("Error fetching stocks from API:", error.message);
//     res.status(500).send("Internal Server Error");
//   }
// }

async function fetchAllStocks(req, res) {
  try {
    const stocks = await getAllStocksWithPrices(); // Fetch stocks with prices
    // console.log(stocks);
    res.render("marketplace", { stocks }); // Pass stocks with prices to the template
  } catch (error) {
    console.error("Error fetching stocks with prices:", error.message);
    res.status(500).send("Internal Server Error");
  }
}

/**
 * Handles the request to buy a stock.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
async function buyStock(req, res) {
  try {
    const { ticker, price, quantity } = req.body;
    const userId = req.session.user?.id;
    // console.log("buy", req.body);
    // console.log(userId);
    const parsedPrice = parseFloat(price);
    const parsedQuantity = parseInt(quantity, 10);

    // Fetch stock price
    // const stocks = await getAllStocksWithPrices();
    // const stock = stocks.find((s) => s.ticker === ticker);

    // if (!stock) {
    //   return res.status(404).send("Stock not found");
    // }

    // const price = stock.price;
    // const totalCost = price * quantity;

    // Update user's cash and portfolio
    // const updatedCash = await updateCash(userId, -totalCost);
    // if (updatedCash.cash < 0) {
    //   return res.status(400).send("Insufficient funds");
    // }

    await addOrUpdateStockModel(userId, ticker, parsedPrice, parsedQuantity);
    // await addTransaction(userId, ticker, quantity, price, "buy");

    res.redirect("/user/portfolio");
  } catch (error) {
    console.error("Error buying stock:", error.message);
    res.status(500).send("Internal Server Error");
  }
}

/**
 * Handles the request to sell a stock.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
async function sellStock(req, res) {
  try {
    const { ticker, quantity } = req.body;
    const userId = req.session.user?.id;
    const parsedQuantity = parseInt(quantity, 10);

    // Fetch user's portfolio and stock details
    const updatedPortfolio = await processSellStockModel(
      userId,
      ticker,
      parsedQuantity
    );

    // Update the user's portfolio
    res.redirect("/user/portfolio");
  } catch (error) {
    console.error("Error selling stock:", error.message);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = { fetchAllStocks, buyStock, sellStock };
