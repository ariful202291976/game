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
    console.log(stocks);
    res.render("marketplace", { stocks }); // Pass stocks with prices to the template
  } catch (error) {
    console.error("Error fetching stocks with prices:", error.message);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = { fetchAllStocks };
