const { render } = require('ejs');
const models = require('../models');
const sequelize = models.sequelize;
const { Transaction, Voucher, Admin, Items } = require('../models');
const { Op } = require('sequelize');

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
        user_id: req.user.user_id, // Assuming the logged-in user (admin or custodian)
        description: req.body.description,
        amountGiven: req.body.amountGive,
        custodianName: req.body.cusName,
        purchaser: req.body.purchaser,
        employeeId: req.body.employeeId,
        total: req.body.total,
        status: 'pending',
        items: req.body.items // Array of items
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

            // Step 2: Map items to include transaction_id
            if (!transaction_data.items || !Array.isArray(transaction_data.items)) {
                throw new Error("Invalid items data");
            }

            const items = transaction_data.items.map(item => ({
                transaction_id: transactionRecord.transaction_id, // Link to the created transaction
                itemName: item.itemName,
                itemAmount: item.itemAmount,
                itemQuantity: item.itemQuantity
            }));

            // Step 3: Insert items using bulkCreate
            await models.Items.bulkCreate(items, { transaction });

            // Commit the transaction if everything is successful
            res.redirect("/addTransaction?message=Success!");
        });
    } catch (error) {
        console.error("Transaction Error:", error);
        res.redirect("/addTransaction?message=ServerError!");
    }
};


// Render Update Transaction Page
const getUpdateTransaction = async (req, res) => {
    const { transactionId } = req.query;

    if (!transactionId) {
        return res.status(400).send('Transaction ID is required.');
    }

    try {
        const transaction = await models.Transactions.findByPk(transactionId)

        if (!transaction) {
            return res.status(404).send('Transaction not found.');
        }

        res.render('custodian/updateTrans', { transaction });
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).send('An error occurred.');
    }
};

// Handle Update Transaction Logic
const postUpdateTransaction = async (req, res) => {
    const { transactionId, orNumber, personalContributions, storeName } = req.body;
    const receipts = req.file ? req.file.filename : null; // Save relative paths

    console.log('Receipt Filename:', receipts);  // Debugging

    try {
        // Validate transaction ID
        if (!transactionId) {
            return res.status(400).send('Transaction ID is required.');
        }

        const transaction = await models.Transactions.findByPk(transactionId, {
            include: [{
                model: models.Custodian,
                include: [{
                    model: models.CashFund
                }]
            }]
        });

        if (!transaction) {
            return res.status(404).send('Transaction not found.');
        }

        // Update transaction fields
        transaction.oRNo = orNumber;
        transaction.personalContri = personalContributions;
        transaction.storeName = storeName;
        transaction.receiptImg = receipts;

        // Fetch the custodian and cash fund linked to the transaction
        const custodian = transaction.Custodian;
        const cashFund = custodian.CashFund;

        // Subtract the transaction total from the cash fund amount
        cashFund.amount -= transaction.total;

        // Save the updated transaction and cash fund
        await transaction.save();
        await cashFund.save();

        // Automatically create a Voucher after updating the transaction
        await models.Voucher.create({
            voucher_id: models.Voucher.voucher_id,
            transaction_id: transaction.transaction_id,
            user_id: transaction.user_id,
            amount: transaction.total,
        });

        // Redirect to dashboard after update
        res.redirect('/dashboardCustodian');
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).send('An error occurred.');
    }
};


const getTransactionForVoucher = async (req, res) => {
    try {
        const transactionId = req.params.id;

        // Fetch the transaction with associated data
        const transaction = await models.Transactions.findOne({
            where: { transaction_id: transactionId },
            include: [
                {
                    model: models.Items,
                    as: 'items'
                },
                {
                    model: models.Voucher,
                    as: 'voucher'
                },
                {
                    model: models.Admin,
                    as: 'approver',
                    attributes: ['full_name', 'user_id', 'signature']
                },
                {
                    model: models.Custodian,
                    attributes: ['custodian_name', 'user_id', 'custodian_no']
                }
            ]
        });

        console.log(JSON.stringify(transaction, null, 2));  // Debug the response


        // Check if the transaction exists
        if (!transaction) {
            return res.status(404).send('Transaction not found');
        }

        // Calculate row totals for items
        const items = transaction.items || [];
        items.forEach((item) => {
            item.rowTotal = parseFloat(item.itemQuantity) * parseFloat(item.itemAmount);
        });

        const grandTotal = items.reduce((sum, item) => sum + item.rowTotal, 0);

        // Extract Admin and Custodian information
        const adminName = transaction.approver?.full_name || 'Admin Not Found';
        const adminSignature = transaction.approver?.signature || '';
        const custodianName = transaction.custodian?.custodian_name || 'Unknown';
        const custodianNo = transaction.custodian?.custodian_no || 'Unknown';

        console.log('Admin Retrieved:', adminName);

        // Pass data to the view
        res.render('custodian/printVoucher', {
            transaction,
            grandTotal,
            voucher: transaction?.voucher,
            admin: {
                full_name: adminName,
                signature: adminSignature
            },
            custodian: transaction.Custodian  // Pass the Custodian directly
        });

        console.log('Admin Signature Path:', transaction.approver?.signature);

    } catch (error) {
        console.error('Transaction retrieval error:', error.message, error.stack);
        res.status(500).send('An error occurred while fetching the transaction');
    }
};

const generateReport = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const custodianData = await models.Custodian.findOne({
            where: { user_id: userId },
            include: [
                {
                    model: models.CashFund,
                    required: true
                },
                {
                    model: models.Transactions
                }
            ]
        });

        if (!custodianData) {
            return res.status(404).send('Custodian not found.');
        }

        const createdAtDate = custodianData.CashFund.createdAt;
        const dateFormatted = createdAtDate.toISOString().split('T')[0];

        const sameDateRecords = await models.CashFund.findAll({
            where: {
                createdAt: {
                    [Op.between]: [`${dateFormatted} 00:00:00`, `${dateFormatted} 23:59:59`]
                }
            }
        });

        const reportSequence = sameDateRecords.length;
        const reportNumber = `${dateFormatted.replace(/-/g, '')}-${String(reportSequence).padStart(3, '0')}`;
        const cashId = custodianData.CashFund?.cashF_id;

        const transactions = custodianData.Transactions || [];
        const reportData = transactions.map((tx) => ({
            date: tx.createdAt,
            remainingFund: parseFloat(tx.total) || 0, // Ensure it's a valid number, default to 0
            description: tx.description,
            total: parseFloat(tx.total) || 0, // Ensure it's a valid number
            voucherNo: tx.voucherNo || 'N/A',
        }));

        res.render('custodian/report', {
            initialFund: custodianData.CashFund.amount,
            reportData,
            custodian: {
                custodian_name: custodianData.custodian_name,
                custodian_no: custodianData.custodian_no
            },
            cashId,
            reportNumber,
            cashFund: {
                createdAt: custodianData.CashFund.createdAt
            }
        });
    } catch (error) {
        console.error('Error generating report:', error.message);
        res.status(500).send('Server error. Please try again later.');
    }
};








module.exports = {
    addTrans,
    addTransaction,
    getUpdateTransaction,
    postUpdateTransaction,
    getTransactionForVoucher,
    generateReport
}