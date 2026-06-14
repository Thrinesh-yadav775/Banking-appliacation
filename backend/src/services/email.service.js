require('dotenv').config();

if (!process.env.BREVO_API_KEY) {
  console.error('BREVO_API_KEY is not set — emails will not be sent');
} else {
  console.log('Brevo email service ready');
}

const sendEmail = async (to, subject, html) => {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'BankApp', email: process.env.EMAIL_USER },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Brevo error: ${err}`);
  }
};

async function sendregistration(userEmail, name) {
  await sendEmail(
    userEmail,
    'Welcome to BankApp',
    `<h2>Welcome to BankApp, ${name}!</h2>
     <p>Thank you for registering. Your account has been created successfully.</p>
     <p>Best regards,<br/>The BankApp Team</p>`,
  );
}

async function sendlogin(userEmail, name) {
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  await sendEmail(
    userEmail,
    'New Login to Your BankApp Account',
    `<h2>New Login Detected</h2>
     <p>Hello <strong>${name}</strong>,</p>
     <p>A new login was detected on your account at <strong>${timestamp}</strong>.</p>
     <p style="color:red;">If this was not you, please contact support immediately.</p>
     <p>Best regards,<br/>The BankApp Team</p>`,
  );
}

async function sendtransactionemail(useremail, name, amount, toaccount) {
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  await sendEmail(
    useremail,
    'Transaction Confirmation - BankApp',
    `<h2>Transaction Confirmation</h2>
     <p>Hello <strong>${name}</strong>,</p>
     <p>Your transaction has been processed successfully.</p>
     <table style="border-collapse:collapse;width:100%;max-width:400px;">
       <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Amount</td><td style="padding:8px;border:1px solid #ddd;">₹${amount}</td></tr>
       <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">To</td><td style="padding:8px;border:1px solid #ddd;">${toaccount}</td></tr>
       <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Date & Time</td><td style="padding:8px;border:1px solid #ddd;">${timestamp}</td></tr>
     </table>
     <p style="color:red;margin-top:16px;">If you did not authorize this, contact support immediately.</p>
     <p>Best regards,<br/>The BankApp Team</p>`,
  );
}

async function sendfailtransactionemail(useremail, name, amount, toaccount) {
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  await sendEmail(
    useremail,
    'Transaction Failed - BankApp',
    `<h2>Transaction Failed</h2>
     <p>Hello <strong>${name}</strong>,</p>
     <p>Your transaction could not be processed.</p>
     <table style="border-collapse:collapse;width:100%;max-width:400px;">
       <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Amount</td><td style="padding:8px;border:1px solid #ddd;">₹${amount}</td></tr>
       <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">To</td><td style="padding:8px;border:1px solid #ddd;">${toaccount}</td></tr>
       <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Date & Time</td><td style="padding:8px;border:1px solid #ddd;">${timestamp}</td></tr>
     </table>
     <p>Please check your balance and try again.</p>
     <p>Best regards,<br/>The BankApp Team</p>`,
  );
}

module.exports = { sendregistration, sendlogin, sendtransactionemail, sendfailtransactionemail };
