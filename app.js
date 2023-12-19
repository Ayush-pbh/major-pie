// Import start here
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path'); // Add this line for working with file paths
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const validator = require('validator');
const serveIndex = require('serve-index');
const csrf = require('csurf');

// const path = require('path');


// Import end here

const app = express();
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});
app.use((err, req, res, next) => {
  if (err && err.code === 'EBADCSRFTOKEN') {
      res.status(403).json({ message: 'Invalid CSRF token' });
  } else {
      next();
  }
});
const refreshTokens = [];

app.post('/submit', (req, res) => {
  const { _csrf, /* other form fields */ } = req.body;

  // Validate CSRF token
  if (_csrf !== req.csrfToken()) {
      return res.status(403).json({ message: 'CSRF token validation failed' });
  }

  // Process the form submission or API request
  // ...
});
const publicPath = path.join(__dirname, 'public');
app.use('/public', serveIndex(publicPath, { 'icons': true }));

const port = 3399;
// localhost:port

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://admingun:randomkisses@cluster0.kkn9p3a.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
/*
mongodb+srv://admingun:randomkisses@cluster0.kkn9p3a.mongodb.net/?retryWrites=true&w=majority
mongodb+srv - monngodb atlas connection
admingun - username of mongo db 
randomkkk - password of mongo db
cluster0.kkn9p3a.mongodb.net -- mongo db database address / unique id
*/

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define the user schema
const userSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    otp : String,
    dob: Date,
});


// Generate a random 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
// Send OTP via email
async function sendOTP(email, otp) {
    try {
      
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in",
  port: 465,
  auth: {
    user: 'noreply@greyproject.studio',
    pass: "NnP?d#X6gaMKdKqS",
  },
  secure: true,
});

// 2FA : on
      
      let mailOptions = {
        from: 'noreply@greyproject.studio',
        to: email,
        subject: 'OTP for Login',
        text: `Your OTP for login is: ${otp}.`
      };
  
      let info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ', info.messageId);
    } catch (error) {
      console.error('Error sending email: ', error);
    }
  }

app.get('/', (req, res) => {
    res.status(200).json({msg:"Hi"});
    // res.status(500).json({msg:"Not Allowed"});
});
// Endpoint to render the registration page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
    // res.status(500).json({msg:"Not Allowed"});
});

// Endpoint to render the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

const User = mongoose.model('User', userSchema);
// Registration endpoint
// Registration endpoint
app.post('/register', async (req, res) => {
  try {
      const { email, username, password, confirmPassword, dob, recaptchaToken } = req.body;
      const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=YOUR_SECRET_KEY&response=${recaptchaToken}&remoteip=${req.socket.remoteAddress}`;
      const response = await fetch(verificationURL, {
        method: 'POST'
      });
      const data = await response.json();

      if (!data.success) {
          return res.status(400).json({ message: 'reCAPTCHA verification failed' });
      }

      // Check if password and confirm password match
      if (password !== confirmPassword) {
          return res.status(400).json({ message: 'Password and confirm password do not match' });
      }

      // Validate inputs
      if (!validator.isEmail(email)) {
          return res.status(400).json({ message: 'Invalid email format' });
      }

      if (!validator.isAlphanumeric(username)) {
          return res.status(400).json({ message: 'Username must be alphanumeric' });
      }

      // Ensure password meets certain criteria, e.g., length, complexity
      if (password.length < 8) {
          return res.status(400).json({ message: 'Password must be at least 8 characters long' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user
      const user = new User({ email, username, password: hashedPassword, dob });

      // Save the user to the database
      await user.save();

      res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Registration failed' });
  }
});

// Login with OTP endpoint
app.post('/login-otp', async (req, res) => {
  try {
      const { email } = req.body;

      // Validate email input
      if (!validator.isEmail(email)) {
          return res.status(400).json({ message: 'Invalid email format' });
      }
// Find the user by email
const user = await User.findOne({ email });
  
// If the user doesn't exist
if (!user) {
  return res.status(401).json({ message: 'Invalid email or password' });
}

      // ...rest of the code
       // Generate OTP
       const otp = generateOTP();
  
       // Save the OTP in the user document (for verification)
       user.otp = otp;
       await user.save();
   
       // Send OTP via email
       await sendOTP(email, otp);
   
       res.json({ message: 'OTP sent to your email for login' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Login with OTP failed' });
  }
});

// Verify OTP and Password endpoint
app.post('/verify-otp', async (req, res) => {
  try {
      const { email, otp, password } = req.body;

      // Validate email input
      if (!validator.isEmail(email)) {
          return res.status(400).json({ message: 'Invalid email format' });
      }

      // Ensure OTP is a 6-digit number
      if (!validator.isNumeric(otp) || otp.length !== 6) {
          return res.status(400).json({ message: 'Invalid OTP' });
      }


      // ...rest of the code
       // Find the user by email
       const user = await User.findOne({ email });
  
       // If the user doesn't exist
       if (!user) {
         return res.status(401).json({ message: 'Invalid email, OTP, or password' });
       }
   
       // Verify OTP
       console.log("otp : "+otp+", User otp : "+user.otp);
       if (user.otp !== otp) {
         return res.status(401).json({ message: 'Invalid OTP' });
       }
   
       // Compare the provided password with the stored hashed password
       const passwordMatch = await bcrypt.compare(password, user.password);
   
       if (!passwordMatch) {
         return res.status(401).json({ message: 'Invalid password' });
       }
   
       // Clear OTP after successful verification
       user.otp = '';
       await user.save();
   
       // Create a JavaScriptWebToken
       const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1d' });
       const refreshToken = jwt.sign({ userId }, secretKey); // No expiration for refresh tokens
       refreshTokens.push(refreshToken);

       res.json({ message: 'Login successful with OTP and password', token, refreshToken });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'OTP and password verification failed' });
  }
});
// Route to refresh access token using refresh token
app.post('/token', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
      return res.sendStatus(401); // Unauthorized if refresh token is invalid or not provided
  }

  jwt.verify(refreshToken, secretKey, (err, decoded) => {
      if (err) {
          return res.sendStatus(403); // Forbidden if refresh token is invalid
      }

      const userId = decoded.userId;
      const accessToken = jwt.sign({ userId }, secretKey, { expiresIn: '15m' });

      res.json({ accessToken });
  });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});