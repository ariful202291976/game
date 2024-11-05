const { updateCash, addTransaction } = require("../models/stockModel");
const fetch = require("node-fetch");

async function getCurrentPrice(ticker) {
  const apiKey = process.env.POLYGON_API_KEY;
  const url = `https://api.polygon.io/v2/last/trade/${ticker}?apiKey=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results.p;
}

async function buyStock(req, res) {
  const { ticker, quantity } = req.body;
  const userId = req.session.user._id;

  const price = await getCurrentPrice(ticker);
  const cost = price * quantity;
  await updateCash(userId, -cost);
  await addTransaction(userId, ticker, quantity, price, "buy");
  res.redirect("/portfolio");
}

module.exports = { buyStock, getCurrentPrice };
