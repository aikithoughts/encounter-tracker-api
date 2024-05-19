// Middleware to check if user is an admin
const userDAO = require('../dao/user');
const isAdmin = async (req, res, next) => {
    try {
        const user = await userDAO.getUserById(req.userId);
        if (!user) {
            return res.status(401).send('Unauthorized. User not found.');
        }
        if (!user.roles.includes('admin')) {
            return res.status(403).send('Unauthorized. User is not an admin.');
        }
        req.user = user;
        next();
    } catch (error) {
        console.error('Error checking admin status:', error);
        res.status(500).send('Internal server error');
    }
};

module.exports = isAdmin;
