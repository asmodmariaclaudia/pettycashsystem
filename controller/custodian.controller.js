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
    const transactionData = {
        user_id: req.user.user_id,
        description: req.body.description,
        amountGiven: req.body.amountGive,
        custodianName: req.body.cusName,
        purchaser: req.body.purchaser,
        employeeId: req.body.employeeId,
        total: parseFloat(req.body.total),
        status: 'pending',
        items: req.body.items // Array of items
    };

    try {
        // Start the transaction for consistency
        await sequelize.transaction(async (transaction) => {
            // Fetch the active report
            const custodian = await models.Custodian.findOne({
                where: { custodian_name: transactionData.custodianName },
                include: [{ model: models.CashFund }],
            });

            const activeReport = await models.Reports.findOne({
                where: { custodian_id: custodian.user_id, endDate: null },
            });

            if (!activeReport) {
                throw new Error('No active report found for this custodian.');
            }

            // Step 1: Create the transaction record
            const transactionRecord = await models.Transactions.create({
                user_id: transactionData.user_id,
                description: transactionData.description,
                amountGiven: transactionData.amountGiven,
                custodianName: transactionData.custodianName,
                purchaser: transactionData.purchaser,
                employeeId: transactionData.employeeId,
                total: transactionData.total,
                status: transactionData.status,
                report_id: activeReport.report_id, // Link to active report
            }, { transaction });

            // Step 2: Map items to include transaction_id
            const items = transactionData.items.map(item => ({
                transaction_id: transactionRecord.transaction_id,
                itemName: item.itemName,
                itemAmount: item.itemAmount,
                itemQuantity: item.itemQuantity,
            }));

            await models.Items.bulkCreate(items, { transaction });

            res.redirect("/dashboardCustodian");
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
    const receipts = req.file ? req.file.filename : null;

    try {
        const transaction = await models.Transactions.findByPk(transactionId, {
            include: [
                {
                    model: models.Custodian,
                    include: [{ model: models.CashFund }],
                },
                {
                    model: models.Reports,
                    as: 'report',
                },
            ],
        });

        if (!transaction) {
            return res.status(404).send('Transaction not found.');
        }

        const custodian = transaction.Custodian;
        const cashFund = custodian?.CashFund;
        const activeReport = transaction.report;

        if (!cashFund) {
            return res.status(400).send('Cash fund data is missing.');
        }
        if (!activeReport) {
            return res.status(400).send('Report data is missing.');
        }

        // Validate transaction total
        if (!transaction.total || transaction.total <= 0) {
            return res.status(400).send('Invalid transaction total.');
        }

        // Update transaction fields
        transaction.oRNo = orNumber;
        transaction.personalContri = personalContributions;
        transaction.storeName = storeName;
        transaction.receiptImg = receipts;

        // Update cash fund and report totals
        cashFund.amount -= transaction.total;
        activeReport.totalAmount += transaction.total;

        // Close the report if the cash fund is depleted
        if (cashFund.amount <= 0) {
            activeReport.endDate = new Date();
            activeReport.pettyCashEnd = 0.00;
        }

        // Save all changes
        await transaction.save();
        await cashFund.save();
        await activeReport.save();

        // Automatically create a Voucher
        await models.Voucher.create({
            transaction_id: transaction.transaction_id,
            user_id: transaction.user_id,
            amount: transaction.total,
        });

        res.redirect("/dashboardCustodian");
    } catch (error) {
        console.error("Error updating transaction:", error.message);
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
        const reportId = req.query.report_id;

        // Find custodian data along with associated transactions, items, and vouchers
        const custodianData = await models.Custodian.findOne({
            where: { user_id: userId },
            include: [
                {
                    model: models.Transactions,
                    where: { status: 'approved' }, // Only include approved transactions
                    include: [
                        {
                            model: models.Items,
                            as: 'items'  // Include associated items
                        },
                        {
                            model: models.Voucher,
                            as: 'voucher'  // Include associated voucher
                        },
                        {
                            model: models.Reports,
                            as: 'report'  // Include related reports
                        }
                    ],
                    order: [['createdAt', 'ASC']]
                }
            ]
        });

        if (!custodianData) {
            return res.status(404).send('Custodian not found.');
        }

        const transactions = custodianData.Transactions || [];
        const cashId = custodianData.cashF_id;

        // Extract and handle the month with defensive checks
        const month = transactions.length > 0 
            ? (() => {
                const startDate = transactions[0]?.startDate;

                if (!startDate) return 'N/A';
                const parts = startDate.split('/');

                if (parts.length !== 3) return 'Invalid Date';

                const monthNum = parseInt(parts[0], 10);
                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                                    'July', 'August', 'September', 'October', 'November', 'December'];

                return monthNames[monthNum - 1] || 'Unknown Month';
            })()
            : 'N/A';

        const startAmount = transactions.length > 0 && transactions[0].report ? transactions[0].report.pettyCashStart : 0;

        let grandTotal = 0;

        // Correctly calculate the report data
        const reportData = transactions.map((tx) => {
            const transactionTotal = parseFloat(tx.total) || 0;
            grandTotal += transactionTotal;


            // Safely retrieve item names with quantity
            const itemNames = Array.isArray(tx.items)
                ? tx.items.map(item => `${item.itemName} (x${item.itemQuantity})`).join(', ')
                : 'No items';

            return {
                date: tx.createdAt,
                storeName: tx.storeName,
                items: itemNames,
                total: transactionTotal,
                voucherNo: tx.voucher ? tx.voucher.voucher_id : 'N/A',
                description: tx.description,
            };
        });

        res.render('custodian/report', {
            reportData,
            cashId,
            custodian: {
                custodian_name: custodianData.custodian_name,
                custodian_no: custodianData.custodian_no
            },
            reportNumber: `Report-${new Date().toISOString().split('T')[0]}`,
            grandTotal,
            startAmount,
            month,
            reportId,
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