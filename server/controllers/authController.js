const User = require('../models/User');
const LoginActivity = require('../models/LoginActivity');
const TestSession = require('../models/TestSession');
const Test = require('../models/Test');
const sendVerificationMail = require('../utils/sendVerificationMail');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require('../config/config');
const sendPasswordResetMail = require('../utils/sendPasswordResetMail');

exports.signup = async (req, res) => {
    try {
        const { name, email, password, year } = req.body;
        if (!name || !email || !password || !year) {
            return res.status(400).send({
                message: "All fields are required"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 8);

        const existing = await User.findOne({ email });
        if (existing) {
            if (existing.isDeleted) {
                existing.name = name;
                existing.password = hashedPassword;
                existing.study_year = year;
                existing.isDeleted = false;
                existing.deletedAt = null;
                existing.isVerified = false;

                await existing.save();
                await sendVerificationMail(existing);
                return res.status(200).send({
                    message: "signup successful"
                })
            }

            const message = existing.isVerified ? "User already exists with this email" : "User already exists and is not verified. Check your inbox for the verification email";
            return res.status(409).send({ message });
        }

        const user = new User({
            name: name,
            email: email,
            password: hashedPassword,
            study_year: year,
        })

        await user.save();
        await sendVerificationMail(user);
        return res.status(200).send({
            message: "signup successful"
        })

    } catch (err) {
        res.status(400).send({ error: err.message });
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).send({
            message: "All fields are required"
        })

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send({ error: "Invalid Credentials" });
        }

        if (user.isDeleted) {
            return res.status(403).send({ message: "This account has been deleted" });
        }

        if (!user.isVerified) {
            await sendVerificationMail(user);
            return res.status(401).send({ message: "user is not verified. Check your inbox for verification mail" });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).send({ error: "Invalid Credentials" });
        }

        const token = jwt.sign({ user_id: user._id }, config.JWT_TOKEN_SECRET, { expiresIn: '30d' });

        user.lastLogin = new Date();
        await user.save();

        await LoginActivity.create({
            user: user._id,
            email: user.email,
            name: user.name,
            loggedInAt: user.lastLogin,
            userAgent: req.headers['user-agent'] || '' // The Navigator.userAgent read-only property of the Navigator interface returns the User-Agent (UA) string for the current browser.
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.status(200).send({
            token: token,
            username: user.name,
            user_id: user._id,
            role: user.role
        });

    } catch (err) {
        res.status(400).send({ error: err.message });
    }
}

exports.me = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user || user.isDeleted) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            username: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            study_year: user.study_year
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.verifyMail = async (req, res) => {
    try {
        const { token } = req.params;

        let decoded;

        try {
            decoded = jwt.verify(token, config.JWT_TOKEN_SIGNUP_MAIL_SECRET);
        } catch (signupVerifyError) {
            // Backward compatibility: old verification links were signed with reset secret.
            decoded = jwt.verify(token, config.JWT_RESET_PASSWORD_SECRET);
        }

        if (!decoded) res.status(400).send({ message: "Invalid Token" });

        const user = await User.findById(decoded.user_id);
        if (!user) return res.status(400).send({ message: "Invalid Token" });

        if (user.isVerified) return res.status(200).send({ message: "User is already verified" })
        user.isVerified = true;

        await user.save();
        res.status(200).send({ message: "User has been verified" });

    } catch (err) {
        res.status(400).send({ message: err.message || "Invalid or expired token" });
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAdminOverview = async (req, res) => {
    try {
        const [usersCount, testsCount, testsTakenCount, activeSessionsCount, recentLogins, recentTestSessions] = await Promise.all([
            User.countDocuments(),
            Test.countDocuments(),
            TestSession.countDocuments({ status: { $in: ['SUBMITTED', 'EXPIRED'] } }),
            TestSession.countDocuments({ status: 'IN_PROGRESS' }),
            LoginActivity.find({})
                .sort({ loggedInAt: -1 })
                .limit(15)
                .populate('user', 'name email role')
                .lean(),
            TestSession.find({ status: { $in: ['SUBMITTED', 'EXPIRED'] } })
                .sort({ submittedAt: -1, updatedAt: -1 })
                .limit(15)
                .populate('user', 'name email role')
                .populate('test', 'title subject duration')
                .lean()
        ]);

        const allLogins = recentLogins.map((item) => ({
            id: item._id,
            loggedInAt: item.loggedInAt,
            userAgent: item.userAgent,
            user: {
                id: item.user?._id,
                name: item.user?.name || item.name || 'Unknown User',
                email: item.user?.email || item.email || '',
                role: item.user?.role || 'student'
            }
        }));

        const allSessions = recentTestSessions.map((item) => ({
            id: item._id,
            submittedAt: item.submittedAt || item.updatedAt,
            status: item.status,
            score: item.score,
            totalQuestions: item.totalQuestions,
            correctAnswers: item.correctAnswers,
            user: {
                id: item.user?._id,
                name: item.user?.name || 'Unknown User',
                email: item.user?.email || '',
                role: item.user?.role || 'student'
            },
            test: {
                id: item.test?._id,
                title: item.test?.title || 'Deleted Test',
                subject: item.test?.subject || 'Unknown',
                duration: item.test?.duration || 0
            }
        }));

        return res.status(200).json({
            stats: {
                usersCount,
                testsCount,
                testsTakenCount,
                activeSessionsCount
            },
            recentLogins: allLogins,
            recentTestSessions: allSessions
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.resetPasswordMail = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email: email });
        if (!user || user.isDeleted) return res.status(400).send({ error: 'Email is not registered with us' });

        await sendPasswordResetMail(user);
        return res.status(200).send({ message: "Password reset link sent to your email" });

    } catch (err) {
        res.status(500).send(err);
    }
}

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirm_password } = req.body;

        if (confirm_password !== password) {
            return res.status(400).send("Passwords don't match");
        }

        const decoded = jwt.verify(token, config.JWT_RESET_PASSWORD_SECRET);
        if (!decoded || !decoded.user_id) {
            return res.status(400).send({ message: "Invalid or expired token" });
        }


        const user = await User.findById(decoded.user_id);
        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }

        const hashedPassword = await bcrypt.hash(password, 8);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).send("success");
    } catch (err) {
        return res.status(400).send(err);
    }
}

exports.logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            // lax: Same-site requests + top-level navigations (clicking a link). Blocks cross-site sub-requests like fetch, XHR, <img>
        });

        res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUserFromAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, study_year } = req.body;
        
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found" });
        
        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (study_year) user.study_year = study_year;
        
        await user.save();
        
        const userWithoutPassword = user.toObject();
        
        delete userWithoutPassword.password;
        
        res.status(200).json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
