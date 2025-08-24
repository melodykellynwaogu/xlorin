require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendMail(from, message) {
  try {
    await transporter.sendMail({
      from: from,
      to: process.env.EMAIL_USER, 
      subject: "New Message from Xlorin Contact Page",
      text: message,
    });
    console.log("✅ Email sent successfully!");
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
}

module.exports = sendMail;