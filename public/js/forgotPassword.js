document.addEventListener("DOMContentLoaded", () => {
  const forgotPasswordForm = document.getElementById("forgotPasswordForm");
  const emailInput = document.getElementById("emailInput");

  // Intercept form submission
  forgotPasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    const email = emailInput.value.trim(); // Get the email input value

    if (!email) {
      alert("Please enter a valid email.");
      return;
    }

    try {
      // Send POST request to /auth/forgot-password
      const response = await fetch("/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }), // Send email in JSON format
      });

      if (response.ok) {
        // Redirect to the next step (Verify OTP)
        console.log(response);
        window.location.href = "/auth/verify-otp";
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error.message);
      alert("An error occurred while sending the OTP. Please try again.");
    }
  });
});
