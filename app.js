// Import start here
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path'); // Add this line for working with file paths
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Import end here

const app = express();
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
app.post('/register', async (req, res) => {
    try {
        const { email, username, password, confirmPassword, dob } = req.body;
        // Destructuring

        // Check if password and confirm password match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Password and confirm password do not match' });
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

// ...
// Login with OTP endpoint
app.post('/login-otp', async (req, res) => {
    try {
      const { email } = req.body;
  
      // Find the user by email
      const user = await User.findOne({ email });
  
      // If the user doesn't exist
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
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
  
      res.json({ message: 'Login successful with OTP and password', token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'OTP and password verification failed' });
    }
  });
  
  // ...
  

// Login endpoint
// app.post('/login', async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Find the user by email
//         const user = await User.findOne({ email });

//         // If the user doesn't exist
//         if (!user) {
//             return res.status(401).json({ message: 'Invalid email or password' });
//         }

//         // Compare the provided password with the stored hashed password
//         const passwordMatch = await bcrypt.compare(password, user.password);

//         if (!passwordMatch) {
//             return res.status(401).json({ message: 'Invalid email or password' });
//         }

//         // Create a JavaScriptWebToken
//         const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1d' });

//         res.json({ message: 'Login successful', token });
        
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Login failed' });
//     }
// });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});