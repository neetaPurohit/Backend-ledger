// got from github
require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

module.exports = transporter;

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmail;

//fnx  to send registration email
async function sendRegistrationEmail(userEmail, name) {
  const subject = "Welcome to Backend Ledger!";

  const text = `Hello ${name},

Thank you for registering at Backend Ledger.
We're excited to have you on board!

Best regards,
The Backend Ledger Team`;

  const html = `<p>Hello ${name},</p>
<p>Thank you for registering at Backend Ledger. We're excited to have you on board!</p>
<p>Best regards,<br>The Backend Ledger Team</p>`;

  await sendEmail(userEmail, subject, text, html);
}

// fnx to send transaction notification email
async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Successful - Backend Ledger";

  const text = `Hello ${name},

Your transaction has been completed successfully.

Transaction Details:
Amount: ₹${amount}
Transferred To: ${toAccount}

Thank you for using Backend Ledger.

Best regards,
The Backend Ledger Team`;

  const html = `
    <p>Hello ${name},</p>

    <p>Your transaction has been completed successfully.</p>

    <h3>Transaction Details</h3>
    <ul>
      <li><strong>Amount:</strong> ₹${amount}</li>
      <li><strong>Transferred To:</strong> ${toAccount}</li>
    </ul>

    <p>Thank you for using <strong>Backend Ledger</strong>.</p>

    <p>Best regards,<br>The Backend Ledger Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}

// fnx to send failed transaction email
async function sendFailedTransactionEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Failed - Backend Ledger";

  const text = `Hello ${name},

Unfortunately, your transaction could not be completed.

Transaction Details:
Amount: ₹${amount}
Recipient: ${toAccount}

No amount has been deducted from your account. Please verify the recipient details or try again later.

If the problem persists, please contact our support team.

Best regards,
The Backend Ledger Team`;

  const html = `
    <p>Hello ${name},</p>

    <p><strong>Your transaction could not be completed.</strong></p>

    <h3>Transaction Details</h3>
    <ul>
      <li><strong>Amount:</strong> ₹${amount}</li>
      <li><strong>Recipient:</strong> ${toAccount}</li>
      <li><strong>Status:</strong> ❌ Failed</li>
    </ul>

    <p>No amount has been deducted from your account. Please verify the recipient details or try again later.</p>

    <p>If the problem persists, please contact our support team.</p>

    <p>Best regards,<br>The Backend Ledger Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}
module.exports = {
  sendRegistrationEmail,
  sendTransactionEmail,
  sendFailedTransactionEmail,
};
