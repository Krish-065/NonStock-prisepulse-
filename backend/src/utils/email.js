const nodemailer = require('nodemailer');
const https = require('https');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

transporter.verify((error) => {
  if (error) console.error('❌ Reusable SMTP Error:', error.message);
  else console.log('✅ Reusable SMTP Ready');
});

/**
 * Sends an email, attempting to use the Brevo HTTP API first (bypassing Render's SMTP block),
 * and falling back to traditional SMTP.
 */
async function sendEmail({ to, subject, html }) {
  if (process.env.EMAIL_PASS && process.env.EMAIL_PASS.startsWith('xsmtpsib-')) {
    try {
      console.log(`Attempting to send email to ${to} via Brevo HTTP API...`);
      const apiResult = await new Promise((resolve, reject) => {
        const postData = JSON.stringify({
          sender: {
            name: process.env.FROM_NAME || 'NonStock',
            email: process.env.FROM_EMAIL
          },
          to: [{ email: to }],
          subject,
          htmlContent: html
        });

        const options = {
          hostname: 'api.brevo.com',
          port: 443,
          path: '/v3/smtp/email',
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': process.env.EMAIL_PASS,
            'content-type': 'application/json',
            'content-length': Buffer.byteLength(postData)
          }
        };

        const req = https.request(options, (res) => {
          let body = '';
          res.on('data', (chunk) => { body += chunk; });
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try {
                resolve({ success: true, body: JSON.parse(body) });
              } catch (e) {
                resolve({ success: true, body: { messageId: 'unknown' } });
              }
            } else {
              resolve({ success: false, error: body });
            }
          });
        });

        req.on('error', (err) => { reject(err); });
        req.write(postData);
        req.end();
      });

      if (apiResult.success) {
        console.log('✅ Email successfully delivered via Brevo HTTP API!');
        return;
      } else {
        console.warn('⚠️ Brevo HTTP API rejected request, trying standard SMTP backup. Error:', apiResult.error);
      }
    } catch (apiError) {
      console.warn('⚠️ Brevo HTTP API request failed, trying standard SMTP backup. Error:', apiError.message);
    }
  }

  // Fallback to SMTP
  console.log(`Sending email to ${to} via traditional SMTP...`);
  await transporter.sendMail({
    from: `"${process.env.FROM_NAME || 'NonStock'}" <${process.env.FROM_EMAIL}>`,
    to,
    subject,
    html,
  });
}

module.exports = {
  sendEmail
};
