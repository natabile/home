const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/user');

// Register user
exports.registerUser = async (req, res) => {
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
exports.loginUser = async (req, res) => {
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
exports.countUsers = async (req, res) => {
  try {
    const userCount = await User.countDocuments();  // Counting the total number of users
    res.status(200).json({ userCount });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all users' usernames (for admin)
exports.getAllUsers = async (req, res) => {
  try {
    // Fetch all users' usernames
    const users = await User.find({}, 'username');  // Only fetch 'username' field
    res.status(200).json({ users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};
