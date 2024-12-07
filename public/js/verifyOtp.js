document.addEventListener("DOMContentLoaded", () => {
  const otpForm = document.querySelector("form");

  otpForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    const otpInput = document.querySelector("input[name='otp']");
    const otp = otpInput.value.trim();

    try {
      const response = await fetch("/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp }), // Send OTP as JSON
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message); // Display success message
        window.location.href = "/auth/reset-password"; // Redirect to reset password page
      } else {
        alert(result.error); // Show error message
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("An error occurred. Please try again.");
    }
  });
});
