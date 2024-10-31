const models = require('../models');
const sequelize = models.sequelize; 
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

const login_view = (req, res) => {
    const message = req.query.message || ""; // Default to empty string if not defined
    res.render("login", { message });
};

const dashboardAdmin_view = async (req, res) => {
    try {
        const custodians = await models.Custodian.findAll({
            include: {
                model: models.User,
                attributes: ['username'] // Assuming username is in the User model
            }
        });
        res.render("admin/dashboardAdmin", { custodians });
    } catch (error) {
        console.error("Error fetching custodians:", error);
        res.render("admin/dashboardAdmin", { custodians: [] });
    }
};


const login_user = async (req, res) => {
    const user_data = {
        username: req.body.username,
        password: req.body.password,
        userType: req.body.type
    };

    try {
        // Find user by username
        const result = await models.User.findOne({ where: { username: user_data.username } });
        if (!result) {
            return res.render("login", { message: "User not found" });
        }

        // Assuming you are hashing passwords, use bcrypt to compare
        const isPasswordValid = bcrypt.compareSync(user_data.password, result.password);
        if (isPasswordValid) {
            const user_result = {
                id: result.user_id,
                username: result.username,
                userType: result.userType,
            };

            const token = jwt.sign(user_result, "secretKey");
            res.cookie("token", token); // Set the token cookie
            return res.redirect("/dashboardAdmin"); // Redirect to the dashboard
        } else {
            return res.render("login", { message: "Invalid password" });
        }
    } catch (error) {
        console.log(error);
        res.render("login", { message: "Server error. Please try again." });
    }
};

const save_user = async (req, res) => {
    const user_data = {
        username: req.body.username_data,
        password: req.body.password_data,
        userType: 'admin'
    };

    try {
        await sequelize.transaction(async (transaction) => {
            const user = await models.User.create(user_data, { transaction });
            if (user.userType === 'admin') {
                await models.Admin.create({ user_id: user.user_id }, { transaction });
            }
            res.redirect("/login?message=Success!"); 
        });
    } catch (error) {
        console.error("Transaction Error:", error);
        res.redirect("/login?message=ServerError!"); 
    }
};

module.exports = {
    login_view,
    save_user,
    login_user,
    dashboardAdmin_view
};