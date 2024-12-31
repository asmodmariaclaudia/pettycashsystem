const { render } = require('ejs');
const models = require('../models');
const { Admin } = require('../models'); // Import Admin model from your models folder
const sequelize = models.sequelize;
const { Transactions } = require('../models');



const add_custodianView = async (req, res) => {
    try {
        // Fetch the admin's full name
        const admin = await models.Admin.findOne({
            where: { user_id: req.user.user_id }, // Assuming req.user.id contains the logged-in user's ID
            include: {
                model: models.User,
                attributes: ['username'], // Include additional User attributes if needed
            },
        });

        const { message, type } = req.query;

        res.render("admin/addCustodian", {
            adminFullName: admin ? admin.full_name : "Admin", // Default to "Admin" if no full_name
        });
    } catch (error) {
        console.error("Error fetching admin full name:", error);
        res.render("admin/addCustodian", {
            adminFullName: "Admin", // Default to "Admin" on error
        });
    }
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
        // Check for duplicate username
        const existingUser = await models.User.findOne({
            where: { username: custodian_data.username },
        });
        if (existingUser) {
            console.log('Duplicate username found');
            return res.redirect("/addCustodian?message=Username already exists&type=error");
        }

        // Check for duplicate custodian_no
        const existingCustodianNo = await models.Custodian.findOne({
            where: { custodian_no: custodian_data.custodian_no },
        });
        if (existingCustodianNo) {
            console.log('Duplicate custodian number found');
            return res.redirect("/addCustodian?message=Custodian number already exists&type=error");
        }

        // Check for duplicate custodian_name
        const existingCustodianName = await models.Custodian.findOne({
            where: { custodian_name: custodian_data.custodian_name },
        });
        if (existingCustodianName) {
            console.log('Duplicate custodian name found');
            return res.redirect("/addCustodian?message=Custodian name already exists&type=error");
        }

        await sequelize.transaction(async (transaction) => {
            // Create the user credentials
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

            res.redirect("/addCustodian?message=Custodian created successfully&type=success");
        });
    } catch (error) {
        console.error("Transaction Error:", error);
        res.redirect("/addCustodian?message=An error occurred creating custodian.&type=error");
    }
};




const updateCashF_view = async (req, res) => {
    try {

        const admin = await models.Admin.findOne({
            where: { user_id: req.user.user_id }, // Assuming req.user.id contains the logged-in user's ID
            include: {
                model: models.User,
                attributes: ['username'], // Include additional User attributes if needed
            },
        });

        const custodians = await models.Custodian.findAll({
            include: {
                model: models.User,
                attributes: ['username']
            }
        });

        const { message, type } = req.query;

        res.render("admin/updateCashF", { custodians, message, type, adminFullName: admin ? admin.full_name : "Admin", });
    } catch (error) {
        console.error("Error fetching custodians:", error);
        res.render("admin/updateCashF", { custodians: [], message: "An error occurred while loading data.", type: "error", adminFullName: "Admin", });
    }
};

const updateCashFund = async (req, res) => {
    const { custodian, newfund_data } = req.body;

    try {
        const custodianRecord = await models.Custodian.findOne({
            where: { custodian_no: custodian },
        });

        if (!custodianRecord) {
            console.log('Custodian record not found');
            return res.redirect("/updateCashF?message=Custodian record not found&type=error");
        }

        const cashFund = await models.CashFund.findOne({
            where: { cashF_id: custodianRecord.cashF_id },
        });

        if (!cashFund) {
            console.log('Cash fund record not found');
            return res.redirect("/updateCashF?message=Cash fund not found&type=error");
        }

        if (parseFloat(cashFund.amount) !== 0.00) {
            console.log('Cannot update cash fund; amount is not zero');
            return res.redirect("/updateCashF?message=Cannot update. Fund amount must be zero.&type=error");
        }

        const newFundAmount = parseFloat(newfund_data);

        // Check if the new fund amount exceeds ₱15,000
        if (newFundAmount > 15000) {
            console.log('New fund amount exceeds ₱15,000');
            return res.redirect("/updateCashF?message=Cannot update. Fund amount cannot exceed ₱15,000.&type=error");
        }

        // Update the cash fund
        cashFund.amount = newFundAmount;
        await cashFund.save();

        // Create a new report
        await models.Reports.create({
            startDate: new Date(), // Set the current date as the report start date
            pettyCashStart: newFundAmount, // The new fund amount
            totalAmount: 0.00, // Initial total amount is 0
            custodian_id: custodianRecord.user_id, // Link to the custodian
        });

        console.log('Cash fund updated and new report created successfully');
        res.redirect("/updateCashF?message=Cash fund updated successfully&type=success");
    } catch (error) {
        console.error("Error updating cash fund:", error);
        res.redirect("/updateCashF?message=An error occurred while updating the cash fund.&type=error");
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
            res.redirect(`/dashboardAdmin?message=Admin details updated successfully!&type=success`);
        });
    } catch (err) {
        console.error("Transaction Error:", err);
        res.redirect(`/dashboardAdmin?message=Error while updating admin details.&type=error`);
    }
};

const getAdminTransactions = async (req, res) => {
    try {

        const admin = await models.Admin.findOne({
            where: { user_id: req.user.user_id }, // Assuming req.user.id contains the logged-in user's ID
            include: {
                model: models.User,
                attributes: ['username'], // Include additional User attributes if needed
            },
        });

        const transactions = await Transactions.findAll({
            attributes: [
              'transaction_id',
              'description',
              'oRNo',
              'amountGiven',
              'custodianName',
              'receiptImg',
              'purchaser',
              'employeeId',
              'personalContri',
              'storeName',
              'total',
              'status',
              'createdAt',
            ]
        });

        const { message, type } = req.query;

        // Render the 'adminViewTransactions' view and pass the transactions
        res.render("admin/adminViewTransaction", { transactions, adminFullName: admin ? admin.full_name : "Admin", });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).send('Internal Server Error');
    }
};



// To handle approving the transaction
const approveTransaction = async (req, res) => {
    const { transaction_id } = req.params;
    const adminId = req.user.user_id; // Assuming admin ID is stored in session

    try {
        const transaction = await models.Transactions.findByPk(transaction_id);

        if (!transaction) {
            return res.status(404).send('Transaction not found');
        }

        // Update transaction status and approvedBy field
        transaction.status = 'approved';
        transaction.approvedBy = adminId; // Assign the approver ID
        await transaction.save();

        res.redirect('/admin-ViewTransactions?message=Transaction Approved!&type=success'); // Refresh view with updated data
    } catch (error) {
        console.error('Error approving transaction:', error);
        res.redirect('/admin-ViewTransactions?message=Error!&type=error'); // Refresh view with updated data
    }
};

// To handle rejecting the transaction
const rejectTransaction = async (req, res) => {
    const { transaction_id } = req.params;

    try {
        const transaction = await models.Transactions.findByPk(transaction_id);

        if (!transaction) {
            return res.status(404).send('Transaction not found');
        }

        // Update transaction status, leaving approvedBy null
        transaction.status = 'rejected';
        transaction.approvedBy = null; // Clear approver field in case of rejection
        await transaction.save();

        res.redirect('/admin-ViewTransactions?message=Transaction Rejected!&type=success'); // Refresh view with updated data
    } catch (error) {
        console.error('Error rejecting transaction:', error);
        res.redirect('/admin-ViewTransactions?message=Error!&type=error'); // Refresh view with updated data
    }
};





module.exports = {
    add_custodianView,
    add_custodian,
    updateCashF_view,
    updateCashFund,
    getCustodianData,
    update_admin,
    getAdminTransactions,
    approveTransaction,
    rejectTransaction
};
