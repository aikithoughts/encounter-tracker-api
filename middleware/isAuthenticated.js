const jwt = require('jsonwebtoken');
const JWT_SECRET = '7734ea469e589dfa26bce7efeb79af7b799fa6acd5ec5fd033ce793ed864524b'

const isAuthenticated = async (req, res, next) => {
    let token = null;

    // Check if token is in the Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    // If token is not found in the headers, check the request body
    if (!token && req.body && req.body.token) {
        token = req.body.token;
    }

    if (!token) {
        return res.status(401).send("Unauthorized. Token missing.");
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded._id; // Extract user ID from the decoded JWT payload
        next();
    } catch (error) {
        //console.error("JWT Verification Error:", error); // Log any JWT verification errors
        return res.status(401).send("Unauthorized. Invalid token.");
    }
};

module.exports = isAuthenticated;
