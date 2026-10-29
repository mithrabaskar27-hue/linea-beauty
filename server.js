require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const app = express();
const PORT = 3000;

// Read form data and JSON data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Open HTML, CSS and other frontend files
app.use(express.static(__dirname));

// Test route
app.get("/api/status", (req, res) => {
    res.json({
        message: "LINÉA Beauty server is running!"
    });
});

// Signup route
app.post("/api/signup", async (req, res) => {
    console.log("SIGNUP REQUEST RECEIVED");

    try {
        const { name, email, password } = req.body;

        // Check required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill in all fields."
            });
        }

        // Check whether the email already exists
        const existingUser = await User.findOne({
            email: email.trim().toLowerCase()
        });
        console.log("Checking email in database...");


        if (existingUser) {
            return res.status(409).json({
                message: "This email is already registered."
            });
        }

        // Encrypt the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save the new user in MongoDB
        await User.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword
        });

        return res.status(201).json({
            message: "Welcome to LINÉA Beauty! Account created."
        });

    } catch (error) {
        console.error("Signup error:", error);

        return res.status(500).json({
            message: "Signup failed: " + error.message
        });
    }
})

// Connect to MongoDB and start the server
async function startServer() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is missing from your .env file.");
        }

        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected successfully!");

        app.listen(PORT, () => {
            console.log(
                "LINÉA Beauty is running at http://localhost:3000"
            );
        });

    } catch (error) {
        console.error("Server startup error:", error.message);
    }
}

startServer();