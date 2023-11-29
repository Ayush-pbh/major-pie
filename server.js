// server.js
// Import start here
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path'); // Add this line for working with file paths
const jwt = require('jsonwebtoken');
// Import end here

const app = express();
const port = 3000;


app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://admingun:randomkisses@cluster0.kkn9p3a.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

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
    dob: Date,
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

// Login endpoint
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });

        // If the user doesn't exist
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Create a JWT token
        const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });

        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Login failed' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});