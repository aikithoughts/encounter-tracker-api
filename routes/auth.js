const express = require('express');
const bcrypt = require('bcrypt');

const { Router } = require("express");
const router = Router();

const userDAO = require('../dao/user');
const isAuthenticated = require('../middleware/isAuthenticated');
const jwt = require('jsonwebtoken');
const JWT_SECRET = '7734ea469e589dfa26bce7efeb79af7b799fa6acd5ec5fd033ce793ed864524b'


router.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    let roles = req.body.roles;

    if (!roles) {
        roles = ["user"];
    }

    try {
        if (!password || password === "") {
            return res.status(400).send("Password required.");
        }

        // Check if user with the same email already exists
        const existingUser = await userDAO.getUser(email);
        if (existingUser) {
            return res.status(409).send("User already exists with this email");
        }

        // Create a new user if email is not already registered
        const newUser = await userDAO.createUser(email, password, roles);

        // Generate JWT token for the new user
        const tokenPayload = {
            _id: newUser._id,
            email: newUser.email,
            roles: newUser.roles
        };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ token });

    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).send("Internal server error");
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!password || password === "") { // no password or password is an empty string
        return res.status(400).send("Password required.");
    }

    try {
        const user = await userDAO.getUser(email);

        if (!user) {
            return res.status(401).send("Could not find user");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).send("Invalid email or password");
        }

        // Generate JWT token for the authenticated user
        const tokenPayload = {
            _id: user._id,
            email: user.email,
            roles: user.roles
        };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({ token });

    } catch (error) {
        res.status(500).send("Internal server error");
    }
});


router.put('/password', isAuthenticated, async (req, res) => {
    const { password } = req.body;

    if (!password || password === "") {
        return res.status(400).send("Password required.");
    }

    try {
        const user = await userDAO.getUserById(req.userId);
        if (!user) {
            return res.status(404).send("User not found.");
        }

        const updatedUser = await userDAO.updateUserPassword(user, password);
        return res.status(200).send(updatedUser);
    } catch (error) {
        console.error("Error updating user password:", error);
        return res.status(500).send("Internal server error");
    }
}); 

router.post('/', async (req, res) => {

    const { name, email, password } = req.body;

    try {
        const newUser = await userDAO.createUser(name, email, password);
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;