const models = require('../models');
const sequelize = models.sequelize; 
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const { Custodian, CashFund } = require('../models');  // Import the models

const login_view = (req, res) => {
    const message = req.query.message || ""; 
    res.render("login", { message });
};

const dashboardAdmin_view = async (req, res) => {
    try {
        const custodians = await models.Custodian.findAll({
            include: [
                {
                    model: models.User,
                    attributes: ['username'], // Fetching the username for display
                },
                {
                    model: models.CashFund,
                    attributes: ['amount'], // Fetching the cash fund amount
                },
            ],
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
        password: req.body.password
    };

    try {
        // find user
        const result = await models.User.findOne({ where: { username: user_data.username } });
        if (!result) {
            return res.render("login", { message: "User not found" });
        }

        // hashing passwords, use bcrypt to compare
        const isPasswordValid = bcrypt.compareSync(user_data.password, result.password);
        
        if (isPasswordValid) {
            const user_result = {
                id: result.user_id,
                username: result.username,
                userType: result.userType,
            };
            
            //the type of user
            if (user_result.userType === "admin") {
                //has token when signed
                const token = jwt.sign(user_result, "secretKey");
                res.cookie("token", token); // Set token cookie
                return res.redirect("/dashboardAdmin");

            } else if (user_result.userType === "custodian") {
                //has token when signed
                const token = jwt.sign(user_result, "secretKey");
                res.cookie("token", token); // Set token cookie
                return res.redirect("/dashboardCustodian"); // 
            }

        } else {
            return res.render("login", { message: "Invalid password / user does not exist!" });
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
        userType: 'admin',
    };

    try {
        // Start a Sequelize transaction
        await sequelize.transaction(async (transaction) => {
            // Create User
            const user = await models.User.create(user_data, { transaction });
            
            // Validate admin creation
            if (user.userType === 'admin') {
                await models.Admin.create(
                    {
                        user_id: user.user_id,
                        full_name: 'admin',
                        signature: req.body.signature || null,
                    },
                    { transaction }
                );
            }

            // Commit transaction and redirect
            res.redirect("/login?message=Success!");
        });
    } catch (error) {
        console.error("Transaction Error:", error);
        res.redirect("/login?message=ServerError!");
    }
};


const updateCustodianStatus = async (req, res) => {
    const { user_id } = req.params;
    const { status } = req.query;

    try {
        //update the custodian's status
        await models.Custodian.update({ status }, { where: { user_id } });

        // balik dashboard
        res.redirect('/dashboardAdmin');
    } catch (error) {
        console.error('Error updating custodian status:', error);
        res.status(500).send('Server Error');
    }
};

const custoDash = async (req, res) => {
    try {
        const userId = req.user.user_id;  // Assuming req.user contains the logged-in user's info
        const custodian = await Custodian.findOne({
            where: { user_id: userId },
            include: {
                model: CashFund,
                attributes: ['amount']
            }
        });

        // Fetch all transactions for the custodian using user_id
        const transactions = await models.Transaction.findAll({
            where: { user_id: userId },  // Filtering transactions by user_id (custodian's user_id)
            attributes: ['transaction_id', 'description', 'oRNo', 'amountGiven', 'custodianName', 'receiptImg', 'purchaser', 'employeeId', 'personalContri', 'storeName', 'total', 'status']
        });

        console.log('Fetched Custodian:', custodian);
        console.log('CashFund Amount:', custodian.CashFund ? custodian.CashFund.amount : 'N/A');

        // Pass the CashFund amount to the view
        res.render('custodian/dashboardCustodian', { 
            cashFund: custodian.CashFund ? custodian.CashFund : { amount: 'N/A' }  // Pass full CashFund or default
        });
    } catch (error) {
        console.error('Error fetching custodian data:', error);
        res.status(500).send('Internal Server Error');
    }
};


const logout = (req, res) => {
    res.cookie("token", '', { maxAge: 1000} )
    const message = req.query.message || "";
    res.render("login", { message })
}

module.exports = {
    login_view,
    save_user,
    login_user,
    dashboardAdmin_view,
    updateCustodianStatus,
    custoDash,
    logout
};
