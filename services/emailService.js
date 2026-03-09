require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const contactEmailTemplate = (name, email, message) => {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f4f4f4; font-family: Arial, sans-serif;">
    <table cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 20px;">
        <tr>
            <td style="padding-bottom: 20px;">
                <h2 style="color: #333333; margin: 0;">New Contact Form Submission</h2>
            </td>
        </tr>
        <tr>
            <td style="padding-bottom: 10px;">
                <strong style="color: #555555;">Name:</strong>
                <p style="margin: 5px 0; color: #333333;">${name}</p>
            </td>
        </tr>
        <tr>
            <td style="padding-bottom: 10px;">
                <strong style="color: #555555;">Email:</strong>
                <p style="margin: 5px 0; color: #333333;">${email}</p>
            </td>
        </tr>
        <tr>
            <td>
                <strong style="color: #555555;">Message:</strong>
                <p style="margin: 5px 0; color: #333333;">${message}</p>
            </td>
        </tr>
    </table>
</body>
</html>`;
};

const sendEmailService = {
  async sendEmail(name, email, message) {
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: "thilinasandeepa1605@gmail.com",
      subject: "Contact Form Submission",
      html: contactEmailTemplate(name, email, message),
    };

    try {
      await transporter.sendMail(mailOptions);
      return { success: true, message: "Email sent successfully" };
    } catch (error) {
      throw new Error("Failed to send email: " + error.message);
    }
  },
};

module.exports = sendEmailService;
