const { render } = require('ejs');
const models = require('../models');
const sequelize = models.sequelize;
const { Transaction, Voucher, Admin, Items } = require('../models');
const { Op } = require('sequelize');

//render addTRans
const addTrans = async (req, res) => {
    try {
        const userId = req.user.user_id; // Ensure `req.user` is set by the auth middleware

        const custo = await models.Custodian.findOne({
            where: { user_id: req.user.user_id }, // Assuming req.user.id contains the logged-in user's ID
            include: {
                model: models.User,
                attributes: ['username'], // Include additional User attributes if needed
            },
        });

        // Fetch the custodian_name for the logged-in user
        const custodian = await models.Custodian.findOne({
            where: { user_id: userId },
            attributes: ['custodian_name'],
        });

        if (!custodian) {
            return res.status(404).send('Custodian not found'); // Handle missing custodian gracefully
        }

        const { message, type } = req.query;

        // Pass the custodian_name to the EJS template
        res.render('custodian/addTransactions', {
            custodian_name: custodian.custodian_name, custodianFullName: custo ? custo.custodian_name : "Custodian", message, type
        });
    } catch (error) {
        console.error('Error fetching custodian:', error.message);
        res.status(500).render('custodian/addTransaction', {
            error: "Server error while loading the page.",
        });
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
        // Check custodian's cash fund balance
        const custodian = await models.Custodian.findOne({
            where: { custodian_name: transactionData.custodianName },
            include: [{ model: models.CashFund }],
        });

        if (!custodian || !custodian.CashFund || custodian.CashFund.balance <= 0) {
            return res.render('custodian/addTransactions', {
                custodian_name: custodian.custodian_name,
                custodianFullName: custodian.custodian_name || "Custodian",
                error: "Cannot proceed with the transaction. Cash fund is depleted.",
            });
        }

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

            const { error } = req.query;

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
        console.error("Transaction Error:", error.message);
        return res.redirect(`/addTransaction?error=${encodeURIComponent(error.message)}`);
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
        const custo = await models.Custodian.findOne({
            where: { user_id: req.user.user_id }, // Assuming req.user.id contains the logged-in user's ID
            include: {
                model: models.User,
                attributes: ['username'], // Include additional User attributes if needed
            },
        });

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
            custodian: transaction.Custodian,  // Pass the Custodian directly
            custodianFullName: custo ? custo.custodian_name : "Custodian"
        });

        console.log('Admin Signature Path:', transaction.approver?.signature);

    } catch (error) {
        console.error('Transaction retrieval error:', error.message, error.stack);
        res.status(500).send('An error occurred while fetching the transaction');
    }
};

const generateReport = async (req, res) => {
    try {
        const userId = req.user.user_id; // Extract user ID from the authenticated request
        const custo = await models.Custodian.findOne({
            where: { user_id: req.user.user_id }, // Assuming req.user.id contains the logged-in user's ID
            include: {
                model: models.User,
                attributes: ['username'], // Include additional User attributes if needed
            },
        });
        const reportId = req.query.report_id; // Get the report_id from the query string (optional)

        // Fetch custodian data and approved transactions
        const custodianData = await models.Custodian.findOne({
            where: { user_id: userId },
            include: [
                {
                    model: models.Transactions,
                    where: {
                        status: 'approved',
                        ...(reportId ? { report_id: reportId } : {}) // Filter by report_id if provided
                    },
                    include: [
                        { model: models.Items, as: 'items' }, // Include related items
                        { model: models.Voucher, as: 'voucher' }, // Include related vouchers
                        { model: models.Reports, as: 'report' } // Include related reports
                    ]
                }
            ],
            order: [[models.Transactions, 'createdAt', 'ASC']] // Sort transactions by creation date
        });

        // Handle case where custodian is not found
        if (!custodianData) {
            return res.status(404).send('Custodian not found.');
        }

        // Extract transactions from the fetched custodian data
        const transactions = custodianData.Transactions || [];
        console.log("Transactions fetched:", JSON.stringify(transactions, null, 2)); // Debug: Log transactions

        // Calculate grand total from all transactions
        let grandTotal = 0;

        const transactionDetails = transactions.map((tx) => {
            const transactionTotal = parseFloat(tx.total) || 0;
            grandTotal += transactionTotal;

            // Format item details
            const itemNames = Array.isArray(tx.items)
                ? tx.items.map(item => `${item.itemName} (x${item.itemQuantity})`).join(', ')
                : 'No items';

            return {
                date: tx.createdAt,
                storeName: tx.storeName,
                items: itemNames,
                total: transactionTotal,
                voucherNo: tx.voucher ? tx.voucher.voucher_id : 'N/A',
                description: tx.description
            };
        });

        // Extract report data for the dropdown menu (if applicable)
        const uniqueReports = [
            ...new Map(
                transactions
                    .filter(tx => tx.report) // Ensure there's a linked report
                    .map(tx => [tx.report.report_id, tx.report]) // Map to report_id as key
            ).values()
        ];

        const reportData = uniqueReports.map(report => ({
            report_id: report.report_id,
            pettyCashStart: report.pettyCashStart
        }));

        // Calculate start amount (if transactions exist)
        const startAmount = transactions.length > 0 && transactions[0].report
            ? transactions[0].report.pettyCashStart
            : 0;

            const month = transactions.length > 0 && transactions[0].report && transactions[0].report.startDate
            ? (() => {
                const startDate = transactions[0].report.startDate; // Access the report's startDate
                const date = new Date(startDate); // Parse the startDate into a Date object
                if (isNaN(date)) return 'Invalid Date'; // Handle invalid dates
                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
                return monthNames[date.getMonth()]; // Retrieve the month name
            })()
            : 'N/A';

        // Render the report view with all required data
        res.render('custodian/report', {
            reportData, // For the dropdown menu
            cashId: custodianData.cashF_id, // Custodian cash ID
            custodian: {
                custodian_name: custodianData.custodian_name,
                custodian_no: custodianData.custodian_no
            },
            reportNumber: `Report-${new Date().toISOString().split('T')[0]}`, // Dynamic report number
            grandTotal, // Total of all transactions
            startAmount, // Initial petty cash amount
            month, // Extracted month for the report
            reportId, // Current report ID
            transactions: transactionDetails, // Transaction details for the table
            custodianFullName: custo ? custo.custodian_name : "Custodian"
        });

    } catch (error) {
        console.error('Error generating report:', error.message); // Debug: Log the error
        res.status(500).send('Server error. Please try again later.'); // Return a server error response
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