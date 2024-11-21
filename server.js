const express = require("express")
require("dotenv").config()
const userRouter = require("./routers/user.route.js")
const adminRouter = require("./routers/admin.route.js")
const custodianRouter = require("./routers/custodian.router.js")
const path = require("path")
const cookieParser = require("cookie-parser")

const app = express()


app.set('view engine', 'ejs')
app.use(cookieParser())
app.use(express.urlencoded({ extended:true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(userRouter);
app.use(adminRouter);
app.use(custodianRouter);

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
