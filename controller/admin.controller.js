const { render } = require('ejs');
const models = require('../models');
const { Admin } = require('../models'); // Import Admin model from your models folder
const sequelize = models.sequelize;



const add_custodianView = (req, res) => {
    res.render("admin/addCustodian");
};

const add_custodian = async (req, res) => {
    const custodian_data = {
        username: req.body.usernameCustodian_data,
        custodian_no: req.body.custodiannum_data,
        password: req.body.passwordCustodian_data,
        custodian_name: req.body.custodianname_data,
        userType: 'custodian'
    };

    try {
        await sequelize.transaction(async (transaction) => {
            // Create the user creds
            const user = await models.User.create(
                {
                    username: custodian_data.username,
                    password: custodian_data.password,
                    userType: custodian_data.userType
                }, 
                { transaction }
            );

            // Create a new CashFund and get the ID
            const cashFund = await models.CashFund.create(
                {
                    user_id: user.user_id,
                    amount: 0.00 // default amount, can be adjusted
                },
                { transaction }
            );

            // Create the custodian and link the cashF_id
            const custodian = await models.Custodian.create(
                {
                    user_id: user.user_id,
                    custodian_no: custodian_data.custodian_no,
                    custodian_name: custodian_data.custodian_name,
                    status: 'active',
                    cashF_id: cashFund.cashF_id // Link to the CashFund
                }, 
                { transaction }
            );

            res.redirect("/addCustodian?message=Success!");
        });
    } catch (error) {
        console.error("Transaction Error:", error);
        res.redirect("/addCustodian?message=ServerError!");
    }
};




const updateCashF_view = async (req, res) => {
    try {
        const custodians = await models.Custodian.findAll({
            include: {
                model: models.User,
                attributes: ['username']
            }
        });
        res.render("admin/updateCashF", { custodians });
    } catch (error) {
        console.error("Error fetching custodians:", error);
        res.render("admin/updateCashF", { custodians: [] });
    }
};


const updateCashFund = async (req, res) => {
    const { custodian, newfund_data } = req.body;

    try {
        // Step 1: Find the Custodian by custodian_no
        const custodianRecord = await models.Custodian.findOne({
            where: { custodian_no: custodian },
        });

        if (!custodianRecord) {
            console.log('Custodian record not found');
            return res.redirect("/updateCashFund?message=CustodianNotFound");
        }

        // Step 2: Use the cashF_id from the Custodian to find the CashFund
        const cashFund = await models.CashFund.findOne({
            where: { cashF_id: custodianRecord.cashF_id },
        });

        if (!cashFund) {
            console.log('Cash fund record not found');
            return res.redirect("/updateCashFund?message=FundNotFound");
        }

        // Step 3: Update the cash fund amount
        cashFund.amount = parseFloat(newfund_data);
        await cashFund.save();

        console.log('Cash fund updated successfully');
        res.redirect("/updateCashF?message=FundUpdated");
    } catch (error) {
        console.error("Error updating cash fund:", error);
        res.redirect("/updateCashF?message=ServerError");
    }
};



const getCustodianData = async (req, res) => {
    const { id } = req.params;
    try {
        const custodian = await models.Custodian.findOne({
            where: { custodian_no: id },
            include: [
                {
                    model: models.User,
                    attributes: ['username'], // You can keep this if still needed
                },
                {
                    model: models.CashFund,
                    attributes: ['amount'],
                },
            ],
            attributes: ['custodian_name'], // Include custodian_name directly
        });

        if (custodian) {
            res.json({
                name: custodian.custodian_name || 'Unknown', // Use custodian_name here
                currentFund: custodian.CashFund ? custodian.CashFund.amount : 0,
            });
        } else {
            res.status(404).json({ message: "Custodian not found" });
        }
    } catch (error) {
        console.error("Error fetching custodian data:", error);
        res.status(500).json({ message: "Server error" });
    }
};




const update_admin = async (req, res) => {
    const user_id = req.user.user_id; // Access the user_id from req.user
    const full_name = req.body.admin_fullname; // Get full name from the form
    const signature = req.file ? req.file.filename : null; // Ensure file exists

    // Ensure user_id is not undefined before proceeding with the update
    if (!user_id) {
        return res.status(400).json({ message: 'User ID is missing.' });
    }

    try {
        // Start a transaction
        await sequelize.transaction(async (transaction) => {
            // Update the Admin table
            const [affectedRows] = await models.Admin.update(
                {
                    full_name: full_name,
                    signature: signature,
                },
                {
                    where: { user_id: user_id },
                    transaction,
                }
            );

            // Check if any rows were updated
            if (affectedRows === 0) {
                throw new Error('No admin record found for the given user ID.');
            }

            // Commit the transaction if successful
            res.json({ message: 'Admin details updated successfully!' });
        });
    } catch (err) {
        console.error("Transaction Error:", err);
        res.status(500).json({ message: 'Error while updating admin details.', error: err.message });
    }
};






module.exports = {
    add_custodianView,
    add_custodian,
    updateCashF_view,
    updateCashFund,
    getCustodianData,
    update_admin
};
