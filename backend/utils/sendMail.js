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
    subject: 'Verify your email with your OTP',
    html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
        <h2 style="color: #333;">Welcome!</h2>
        <p>Please use the following 6-digit OTP to verify your account.</p>
        <div style="font-size: 24px; font-weight: bold; background: #eee; padding: 15px; letter-spacing: 5px; margin: 20px auto; width: fit-content; border-radius: 8px;">
          ${token}
        </div>
        <p style="font-size: 0.9rem; color: #555;">This OTP is required to activate your account.</p>
      </div>`,
  };

  await transporter.sendMail(mailOptions);
};

export default sendVerificationEmail;
