document.addEventListener("DOMContentLoaded", () => {
  const sellButtons = document.querySelectorAll(".sell-button");
  const modal = document.getElementById("sellStockModal");
  const closeButton = modal.querySelector(".close-button");

  const modalTicker = document.getElementById("modalTicker");
  const modalAveragePrice = document.getElementById("modalAveragePrice");
  const modalStockTicker = document.getElementById("modalStockTicker");
  const modalStockAveragePrice = document.getElementById(
    "modalStockAveragePrice"
  );
  const modalStockQuantity = document.getElementById("modalStockQuantity");
  const sellQuantity = document.getElementById("sellQuantity");
  const sellStockForm = document.getElementById("sellStockForm");

  // Event listener for sell buttons
  sellButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const ticker = button.getAttribute("data-ticker");
      const quantity = parseInt(button.getAttribute("data-quantity"), 10);
      const averagePrice = button.getAttribute("data-average-price");

      // Set modal fields
      modalTicker.value = ticker;
      modalAveragePrice.value = averagePrice;
      modalStockTicker.textContent = ticker;
      modalStockAveragePrice.textContent = averagePrice;
      modalStockQuantity.textContent = quantity;

      // Set max value for the quantity input
      sellQuantity.value = ""; // Clear previous value
      sellQuantity.max = quantity; // Set max attribute
      sellQuantity.placeholder = `Enter quantity`; // Optional: show max in placeholder

      // Display the modal
      modal.style.display = "block";
    });
  });

  // Close modal logic
  closeButton.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Close modal if clicked outside content
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  // Intercept form submission to post data
  sellStockForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent actual form submission

    // Get form data
    const formData = {
      ticker: modalTicker.value,
      //   averagePrice: modalAveragePrice.value,
      quantity: sellQuantity.value,
    };

    // Post the data to the /sell/stock route using fetch API
    try {
      const response = await fetch("/sell/stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticker: formData.ticker,
          quantity: formData.quantity,
        }), // Send the form data as JSON
      });

      //   const data = await response.json();

      if (response.ok) {
        // Optionally, close the modal and show a success message
        modal.style.display = "none";
        alert("Stock sold successfully!");
        window.location.href = "/user/portfolio";
      } else {
        alert("Error selling stock.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("There was an error with the request.");
    }
  });
});
