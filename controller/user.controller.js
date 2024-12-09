const models = require('../models');
const sequelize = models.sequelize; 
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const { Custodian, CashFund, Transactions } = require('../models');  // Import the models


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
            return res.redirect("/login?message=User not found&type=error");
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
            return res.redirect("/login?message=Invalid password&type=error");
        }
    } catch (error) {
        console.log(error);
        res.redirect("/login?message=Server error. Please try again.&type=error");
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
            res.redirect("/login?message=Sign up successful&type=success");
        });
    } catch (error) {
        console.error("Transaction Error:", error);
        res.redirect("/login?message=Failed to sign up. Please try again.&type=error");
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
        const userId = req.user.user_id; // Extract user ID from authenticated user
        const custodian = await Custodian.findOne({
            where: { user_id: userId },
            include: [
                {
                    model: CashFund,
                    attributes: ['amount']
                },
                {
                    model: Transactions,
                    attributes: [
                        'transaction_id',
                        'description',
                        'createdAt',
                        'total',
                        'purchaser',
                        'employeeId',
                        'custodianName',
                        'status',
                        'oRNo',
                        'storeName',
                        'personalContri'
                    ]
                }
            ]
            
        });

        // If no custodian is found
        if (!custodian) {
            return res.status(404).send('Custodian not found');
        }

        // Pass data to the EJS template
        const cashFund = custodian.CashFund || { amount: '0.00' }; // Default if no cash fund
        const transactions = custodian.Transactions || [];

        const showNotification = cashFund && cashFund.amount === '0.00';

        res.render('custodian/dashboardCustodian', { cashFund, transactions, showNotification });
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
