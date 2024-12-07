document.addEventListener("DOMContentLoaded", () => {
  const resetForm = document.querySelector("form");

  resetForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    const password = document
      .querySelector("input[name='password']")
      .value.trim();
    const confirmPassword = document
      .querySelector("input[name='confirmPassword']")
      .value.trim();

    if (password !== confirmPassword) {
      alert("Passwords do not match. Please try again.");
      return;
    }

    try {
      const response = await fetch("/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }), // Send passwords as JSON
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message); // Display success message
        window.location.href = "/auth/login"; // Redirect to login page
      } else {
        alert(result.error); // Display error message
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("An error occurred. Please try again.");
    }
  });
});
