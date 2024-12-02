const { render } = require('ejs');
const models = require('../models');
const sequelize = models.sequelize;

const addTrans = async (req, res) => {
    try {
        const userId = req.user.user_id; // Ensure `req.user` is set by the auth middleware

        // Fetch the custodian_name for the logged-in user
        const custodian = await models.Custodian.findOne({
            where: { user_id: userId },
            attributes: ['custodian_name'],
        });

        if (!custodian) {
            return res.status(404).send('Custodian not found'); // Handle missing custodian gracefully
        }

        // Pass the custodian_name to the EJS template
        res.render('custodian/addTransactions', {
            custodian_name: custodian.custodian_name,
        });
    } catch (error) {
        console.error('Error fetching custodian:', error);
        res.status(500).send('Server error');
    }
}

// Add a partial transaction
const addTransaction = async (req, res) => {
    const transaction_data = {
        user_id: req.user.user_id,  // Assuming the logged-in user (admin or custodian)
        description: req.body.description,
        amountGiven: req.body.amountGive,
        custodianName: req.body.cusName,
        purchaser: req.body.purchaser,
        employeeId: req.body.employeeId,
        total: req.body.total,
        status: 'pending',
        items: req.body.items  // Array of items (should include item details like name, amount, quantity)
    };

    try {
        // Start the transaction for consistency
        await sequelize.transaction(async (transaction) => {
            // Step 1: Create the transaction record first
            const transactionRecord = await models.Transactions.create({
                user_id: transaction_data.user_id,
                description: transaction_data.description,
                amountGiven: transaction_data.amountGiven,
                custodianName: transaction_data.custodianName,
                purchaser: transaction_data.purchaser,
                employeeId: transaction_data.employeeId,
                total: transaction_data.total,
                status: transaction_data.status
            }, { transaction });

            // Step 2: Create items and associate them with the transaction
            const items = transaction_data.items.map(item => ({
                transaction_id: transactionRecord.transaction_id,  // Link to the created transaction
                itemName: item.itemName,
                itemAmount: item.itemAmount,
                itemQuantity: item.itemQuantity
            }));

            // Step 3: Insert items using bulkCreate to associate them with the transaction
            await models.Items.bulkCreate(items, { transaction });

            // Commit the transaction if everything is successful
            res.redirect("/addTransaction?message=Success!");
        });
    } catch (error) {
        console.error("Transaction Error:", error);
        res.redirect("/addTransaction?message=ServerError!");
    }
};

// Update transaction after approval (admin approval)
const updateTransaction = async (req, res) => {
    
};

const PrintVouch = async (req, res) => {
    res.render("custodian/printVoucher")
}

module.exports = {
    addTrans,
    addTransaction,
    updateTransaction,
    PrintVouch
}