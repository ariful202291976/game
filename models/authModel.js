const nodemailer = require("nodemailer");

function sentOtpModel(email, otp) {
  // Set up Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail", // Use Gmail as the email provider
    auth: {
      user: "ariful00892@gmail.com", // Replace with your Gmail address
      pass: "yiuh sagk rndf bjxe", // Replace with the generated App Password
    },
  });

  const mailOptions = {
    from: "ariful00892@gmail.com",
    to: email,
    subject: "Stock Simultation: OTP Code",
    text: `Your OTP code is: ${otp}`,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending OTP:", err.message);
        return reject(err); // Reject the promise on error
      }
      // console.log("OTP sent:", info.response);
      resolve(otp); // Resolve with the OTP
    });
  });
}

module.exports = {
  sentOtpModel,
};
