import nodemailer from 'nodemailer';

const sendResetMail = async (email, token) => {
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

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
    subject: 'Password Reset Request',
    html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>You requested a password reset. Click the button below to set a new password.</p>
        <a href="${resetLink}" 
           style="
             display: inline-block;
             padding: 12px 25px;
             margin: 20px 0;
             font-size: 16px;
             color: white;
             background-color: #007bff;
             border-radius: 5px;
             text-decoration: none;
             font-weight: bold;
           "
           onmouseover="this.style.backgroundColor='#0056b3'"
           onmouseout="this.style.backgroundColor='#007bff'">
           🔑 Reset Password
        </a>
        <p style="font-size: 0.9rem; color: #555;">If the button doesn't work, copy and paste the following link into your browser:</p>
        <p style="font-size: 0.8rem; color: #555;">${resetLink}</p>
        <p style="font-size: 0.8rem; color: #999;">If you didn't request this, you can safely ignore this email.</p>
      </div>`,
  };

  await transporter.sendMail(mailOptions);
};

export default sendResetMail;
