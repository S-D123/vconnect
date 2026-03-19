const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = async (req, res, next) => {
    try {
        // Get the token from the request header
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        // Verify the token
        const payload = jwt.verify(jwtToken, process.env.JWT_SECRET);

        // Attach the user ID from the token payload to the request object
        req.user = payload.user; 
        next();
    } catch (err) {
        console.error(err.message);
        return res.status(403).json("Not Authorized");
    }
};