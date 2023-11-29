const nodemailer = require('nodemailer');

async function sendEmail() {
  try {
    // Create a transporter using SMTP transport
    let transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'yourEmail@gmail.com', // Your Gmail address
        pass: 'yourPassword' // Your Gmail password or App Password
      }
    });

    // Define email options
    let mailOptions = {
      from: 'yourEmail@gmail.com', // Sender address
      to: 'recipient@example.com', // List of recipients
      subject: 'Test Email', // Subject line
      text: 'This is a test email sent using Nodemailer.' // Plain text body
    };

    // Send mail with defined transport object
    let info = await transporter.sendMail(mailOptions);

    console.log('Email sent: ', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email: ', error);
    return false;
  }
}

// Call the function to send the email
sendEmail();
