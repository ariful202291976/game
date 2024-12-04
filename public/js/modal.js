document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("buyStockModal");
  const closeButton = document.querySelector(".close-button");
  const buyStockForm = document.getElementById("buyStockForm");
  const stockNameSpan = document.getElementById("stockName");
  const pricePerUnitSpan = document.getElementById("pricePerUnit");
  const stockTickerInput = document.getElementById("stockTicker");
  const stockPriceInput = document.getElementById("stockPrice");

  // Open modal when "Buy Stock" button is clicked
  document.querySelectorAll(".create-game-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      const stockName = button.getAttribute("data-name");
      const stockPrice = button.getAttribute("data-price");
      const stockTicker = button.getAttribute("data-ticker");

      // Update modal content
      stockNameSpan.textContent = stockName;
      pricePerUnitSpan.textContent = stockPrice;
      stockTickerInput.value = stockTicker;
      stockPriceInput.value = stockPrice;

      // Show modal
      modal.style.display = "block";
    });
  });

  // Close modal
  closeButton.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Close modal when clicking outside of it
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});
