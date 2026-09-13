const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

const isAdmin = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        jwt.verify(token, config.JWT_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            try {
                const user = await User.findById(decoded.user_id);
                if (!user || user.role !== 'admin') {
                    return res.status(403).json({ error: 'Access denied. Admins only.' });
                }

                req.userId = user._id.toString();
                req.user = user;
                next();
            } catch (error) {
                res.status(500).json({ error: 'Server error' });
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = isAdmin;
