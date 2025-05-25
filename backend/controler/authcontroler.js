const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../model/user');
const nodemailer = require('nodemailer');

// Register user
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.json({ token, role: user.role, username: user.username, user: { _id: user._id } });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Count the number of registered users (for admin)
const countUsers = async (req, res) => {
  try {
    const userCount = await User.countDocuments();  // Counting the total number of users
    res.status(200).json({ userCount });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all users' usernames (for admin)
const getAllUsers = async (req, res) => {
  try {
    // Fetch all users' usernames
    const users = await User.find({}, 'username');  // Only fetch 'username' field
    res.status(200).json({ users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    console.log('Generated reset token:', resetToken);
    console.log('Generated hashed token:', resetPasswordToken);

    // Set token expiry to 10 minutes
    const resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    // Save token to user
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    // Create reset URL
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    try {
      console.log('Starting email process...');
      console.log('Using email credentials:', {
        username: process.env.EMAIL_USERNAME,
        passwordLength: process.env.EMAIL_PASSWORD?.length || 0
      });

      // Create transporter for sending real emails
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        },
        debug: true, // Enable debug logs
        logger: true  // Log to console
      });

      console.log('Created transporter, verifying connection...');

      // Verify SMTP connection
      await new Promise((resolve, reject) => {
        transporter.verify((error, success) => {
          if (error) {
            console.error('SMTP Verification Error:', error);
            reject(error);
          } else {
            console.log('SMTP Connection Verified:', success);
            resolve(success);
          }
        });
      });

      // Send the actual email
      const siteName = 'Home Property Management';
      const mailOptions = {
        from: {
          name: siteName,
          address: process.env.EMAIL_USERNAME
        },
        to: user.email,
        subject: `${siteName} - Password Reset Request`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <img src="https://img.icons8.com/color/96/000000/home.png" alt="Home Icon" style="display: block; margin: 0 auto;">
            <h1 style="color: #1976d2; text-align: center; margin-bottom: 20px;">${siteName}</h1>
            <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              Hello,<br><br>
              We received a request to reset your password. If you didn't make this request, you can safely ignore this email.
            </p>
            <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              To reset your password, click the button below:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
            </div>
            <p style="color: #666; font-size: 14px; line-height: 1.5; margin-top: 20px;">
              This link will expire in 10 minutes for security reasons.<br>
              If the button doesn't work, you can copy and paste this link into your browser:<br>
              <span style="color: #1976d2;">${resetUrl}</span>
            </p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>If you need assistance, please contact our support team.</p>
            </div>
          </div>
        `,
        headers: {
          'priority': 'high',
          'x-entity-ref-id': user._id.toString(), // Add a unique identifier
          'List-Unsubscribe': `<mailto:${process.env.EMAIL_USERNAME}?subject=unsubscribe>` // Add unsubscribe header
        },
        text: `Reset your password for ${siteName}\n\nClick this link to reset your password: ${resetUrl}\n\nThis link will expire in 10 minutes.` // Plain text version
      };

      console.log('Attempting to send email with options:', {
        to: user.email,
        from: mailOptions.from
      });

      // Send email with better error handling
      const info = await transporter.sendMail(mailOptions);
      
      console.log('Email Sending Result:', {
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted,
        rejected: info.rejected
      });

      if (info.rejected && info.rejected.length > 0) {
        throw new Error(`Email was rejected for: ${info.rejected.join(', ')}`);
      }
    } catch (emailError) {
      console.error('Email Sending Error:', emailError);
      throw emailError; // Re-throw to be caught by the outer try-catch
    }
    
    // Also log the URL for debugging
    console.log('Password Reset URL:', resetUrl);

    res.status(200).json({ message: 'Reset password email sent' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error sending reset password email' });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Hash the token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    console.log('Received token:', token);
    console.log('Hashed token:', resetPasswordToken);

    // Find user with token and check if token is expired
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    console.log('Found user:', user);

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password and save
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error resetting password' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  countUsers,
  getAllUsers,
  forgotPassword,
  resetPassword
};
