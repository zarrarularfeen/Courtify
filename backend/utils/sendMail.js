// sendMail.js
import nodemailer from 'nodemailer';

const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${process.env.BASE_URL}/auth/verify?token=${token}`;

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify your email',
    html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
        <h2 style="color: #333;">Welcome!</h2>
        <p>Please verify your email to activate your account.</p>
        <a href="${verificationLink}" 
           style="
             display: inline-block;
             padding: 12px 25px;
             margin: 20px 0;
             font-size: 16px;
             color: white;
             background-color: #28a745;
             border-radius: 5px;
             text-decoration: none;
             font-weight: bold;
           "
           onmouseover="this.style.backgroundColor='#218838'"
           onmouseout="this.style.backgroundColor='#28a745'">
           ✅ Click to Verify
        </a>
        <p style="font-size: 0.9rem; color: #555;">If the button doesn't work, copy and paste the following link into your browser:</p>
        <p style="font-size: 0.8rem; color: #555;">${verificationLink}</p>
      </div>`,
  };

  await transporter.sendMail(mailOptions);
};

export default sendVerificationEmail;
