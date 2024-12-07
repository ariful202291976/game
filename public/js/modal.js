document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("buyStockModal");
  const closeButton = document.querySelector(".close-button");
  // const buyStockForm = document.getElementById("buyStockForm");
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

  // Attach event listener to the Buy button in the modal (form submit)
  const buyStockForm = document.getElementById("buyStockForm");
  buyStockForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent form submission to handle data logging

    // Get the input values inside the submit listener
    const quantityInput = document.getElementById("quantity");
    const ticker = stockTickerInput.value;
    const price = stockPriceInput.value;
    const quantity = quantityInput.value;

    // Log the input values
    console.log("Form submitted with the following data:");
    console.log(`Stock Ticker: ${ticker}`);
    console.log(`Price per Unit: $${price}`);
    console.log(`Quantity: ${quantity}`);

    try {
      // Send form data to the server using fetch
      const response = await fetch("/buy/stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticker, price, quantity }),
      });

      if (response.ok) {
        alert("Stock purchased successfully!");
        window.location.href = "/user/portfolio";
      } else {
        alert("Error in buying stock.");
      }
    } catch (error) {
      console.error("Network error:", error);
    }

    // Close the modal
    modal.style.display = "none";
  });
});
