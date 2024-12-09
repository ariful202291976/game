const {
  getAllStocks,
  getAllStocksWithPrices,
  addOrUpdateStockModel,
  processSellStockModel,
} = require("../models/stockModel");

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

async function manageStocks(req, res) {
  try {
    const stocks = await getAllStocksWithPrices(); // Fetch stocks with prices
    res.render("manageStocks", { stocks, title: "Manage Stocks" }); // Pass stocks with prices to the template
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
    const parsedPrice = parseFloat(price);
    const parsedQuantity = parseInt(quantity, 10);

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

module.exports = { fetchAllStocks, manageStocks, buyStock, sellStock };
