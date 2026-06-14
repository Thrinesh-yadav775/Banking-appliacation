require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM || 'BankApp <onboarding@resend.dev>';

const sendEmail = async (to, subject, html) => {
  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) throw error;
};

async function sendregistration(userEmail, name) {
  await sendEmail(
    userEmail,
    'Welcome to Backend Ledger',
    `<h2>Welcome to Backend Ledger, ${name}!</h2>
     <p>Thank you for registering. Your account has been created successfully.</p>
     <p>Best regards,<br/>The Backend Ledger Team</p>`,
  );
}

async function sendlogin(userEmail, name) {
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  await sendEmail(
    userEmail,
    'New Login to Your Backend Ledger Account',
    `<h2>New Login Detected</h2>
     <p>Hello <strong>${name}</strong>,</p>
     <p>A new login was detected on your account at <strong>${timestamp}</strong>.</p>
     <p style="color:red;">If this was not you, please contact support immediately.</p>
     <p>Best regards,<br/>The Backend Ledger Team</p>`,
  );
}

async function sendtransactionemail(useremail, name, amount, toaccount) {
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  await sendEmail(
    useremail,
    'Transaction Confirmation - Backend Ledger',
    `<h2>Transaction Confirmation</h2>
     <p>Hello <strong>${name}</strong>,</p>
     <p>Your transaction has been processed successfully.</p>
     <table style="border-collapse:collapse;width:100%;max-width:400px;">
       <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Amount</td><td style="padding:8px;border:1px solid #ddd;">₹${amount}</td></tr>
       <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">To</td><td style="padding:8px;border:1px solid #ddd;">${toaccount}</td></tr>
       <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Date & Time</td><td style="padding:8px;border:1px solid #ddd;">${timestamp}</td></tr>
     </table>
     <p style="color:red;margin-top:16px;">If you did not authorize this, contact support immediately.</p>
     <p>Best regards,<br/>The Backend Ledger Team</p>`,
  );
}

async function sendfailtransactionemail(useremail, name, amount, toaccount) {
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  await sendEmail(
    useremail,
    'Transaction Failed - Backend Ledger',
    `<h2>Transaction Failed</h2>
     <p>Hello <strong>${name}</strong>,</p>
     <p>Your transaction could not be processed.</p>
     <table style="border-collapse:collapse;width:100%;max-width:400px;">
       <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Amount</td><td style="padding:8px;border:1px solid #ddd;">₹${amount}</td></tr>
       <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">To</td><td style="padding:8px;border:1px solid #ddd;">${toaccount}</td></tr>
       <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Date & Time</td><td style="padding:8px;border:1px solid #ddd;">${timestamp}</td></tr>
     </table>
     <p>Please check your balance and try again.</p>
     <p>Best regards,<br/>The Backend Ledger Team</p>`,
  );
}

module.exports = { sendregistration, sendlogin, sendtransactionemail, sendfailtransactionemail };
