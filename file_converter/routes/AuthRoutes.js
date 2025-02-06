const express = require('express');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require('../model/user');

const router = express.Router();

// user registeration route

router.post('/register', async (req, res) => {

  try {
    const { email, password } = req.body;

    // check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "user already exists" });
    }

    //hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create a new user

    user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "user registered successfully" })

  }
  catch (error) {
    req.status(500).json({ message: "server error", error })
  }
});


//user login route

router.post("/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    //check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "invalid credentials" })
    }
    //compare password

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "invalid credentials" });
    }

    // generate jwt token

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });

  } catch (error) {
    res.status(500).json({ message: "server error", error });
  }
})
module.exports = router;