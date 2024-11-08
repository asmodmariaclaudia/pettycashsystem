const addTrans = async (req, res) => {
    res.render("custodian/addTransactions")
}

const CustoViewTrans = async (req, res) => {
    res.render("custodian/custodianViewTrans")
}

const PrintVouch = async (req, res) => {
    res.render("custodian/printVoucher")
}

module.exports = {
    addTrans,
    CustoViewTrans,
    PrintVouch
}