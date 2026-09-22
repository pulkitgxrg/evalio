const User = require('../models/User');

exports.profileInfo = async (req,res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId);

        if (!user || user.isDeleted) {
            return res.status(400).send({ message: "User not found"});
        }

        res.status(200).send({
            name: user.name,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            role: user.role,
            study_year: user.study_year
        });

    } catch (err) {
        res.status(500).send(err);
    }
}

exports.updateProfile = async (req,res) => {
    try {
        const userId = req.userId;
        const { name, study_year } = req.body;

        const user = await User.findById(userId);

        if (!user || user.isDeleted) {
            return res.status(400).send({ message: "User not found"});
        }
        
        if(name) user.name = name;
        if(study_year) user.study_year = study_year;

        await user.save();
        
        res.status(200).send({ message: "Profile updated successfully"});
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId);

        if (!user || user.isDeleted) {
            return res.status(400).send({ message: "User not found"});
        }

        await User.findByIdAndUpdate(userId, {
            isDeleted: true,
            deletedAt: new Date(),
        });

        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });

        res.status(200).send({ message: "Account deleted successfully"});
    } catch (err) {
        res.status(500).send(err);
    }
}
