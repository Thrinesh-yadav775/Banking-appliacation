require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend-Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendregistration(userEmail, name) {
  const subject = 'Welcome to Backend Ledger';
  const text = `Hello ${name},\n\nThank you for registering with Backend Ledger. Your account has been created successfully.\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `
    <h2>Welcome to Backend Ledger, ${name}!</h2>
    <p>Thank you for registering. Your account has been created successfully.</p>
    <p>Best regards,<br/>The Backend Ledger Team</p>
  `;
  await sendEmail(userEmail, subject, text, html);
}
async function sendtransactionemail(useremail, name, amount, toaccount) {
  const subject = 'Transaction Confirmation - Backend Ledger';
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const text = `Hello ${name},\n\nYour transaction has been processed successfully.\n\nAmount: ₹${amount}\nTo Account: ${toaccount}\nDate & Time: ${timestamp}\n\nIf you did not authorize this transaction, please contact support immediately.\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `
    <h2>Transaction Confirmation</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your transaction has been processed successfully.</p>
    <table style="border-collapse:collapse;width:100%;max-width:400px;">
      <tr>
        <td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Amount</td>
        <td style="padding:8px;border:1px solid #ddd;">₹${amount}</td>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #ddd;font-weight:bold;">To Account</td>
        <td style="padding:8px;border:1px solid #ddd;">${toaccount}</td>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Date & Time</td>
        <td style="padding:8px;border:1px solid #ddd;">${timestamp}</td>
      </tr>
    </table>
    <p style="color:red;margin-top:16px;">If you did not authorize this transaction, please contact support immediately.</p>
    <p>Best regards,<br/>The Backend Ledger Team</p>
  `;
  await sendEmail(useremail, subject, text, html);
}
async function sendfailtransactionemail(useremail, name, amount, toaccount) {
  const subject = 'Transaction Failed - Backend Ledger';
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const text = `Hello ${name},\n\nYour transaction could not be processed.\n\nAmount: ₹${amount}\nTo Account: ${toaccount}\nDate & Time: ${timestamp}\n\nPlease check your account balance and try again. If the issue persists, contact support.\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `
    <h2>Transaction Failed</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Unfortunately, your transaction could not be processed.</p>
    <table style="border-collapse:collapse;width:100%;max-width:400px;">
      <tr>
        <td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Amount</td>
        <td style="padding:8px;border:1px solid #ddd;">₹${amount}</td>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #ddd;font-weight:bold;">To Account</td>
        <td style="padding:8px;border:1px solid #ddd;">${toaccount}</td>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Date & Time</td>
        <td style="padding:8px;border:1px solid #ddd;">${timestamp}</td>
      </tr>
    </table>
    <p style="color:red;margin-top:16px;">Please check your account balance and try again. If the issue persists, contact support.</p>
    <p>Best regards,<br/>The Backend Ledger Team</p>
  `;
  await sendEmail(useremail, subject, text, html);
}

async function sendlogin(userEmail, name) {
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const subject = 'New Login to Your Backend Ledger Account';
  const text = `Hello ${name},\n\nA new login was detected on your account at ${timestamp}.\n\nIf this was not you, please contact support immediately.\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `
    <h2>New Login Detected</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>A new login was detected on your account.</p>
    <table style="border-collapse:collapse;width:100%;max-width:400px;">
      <tr>
        <td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Date & Time</td>
        <td style="padding:8px;border:1px solid #ddd;">${timestamp}</td>
      </tr>
    </table>
    <p style="color:red;margin-top:16px;">If this was not you, please contact support immediately.</p>
    <p>Best regards,<br/>The Backend Ledger Team</p>
  `;
  await sendEmail(userEmail, subject, text, html);
}

module.exports = { sendregistration, sendlogin, sendtransactionemail, sendfailtransactionemail };
