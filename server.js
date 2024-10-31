const express = require("express")
require("dotenv").config()
const userRouter = require("./routers/user.route.js")
const adminRouter = require("./routers/admin.route.js")
const path = require("path")
const cookieParser = require("cookie-parser")

const app = express()


app.set('view engine', 'ejs')
app.use(cookieParser())
app.use(express.urlencoded({ extended:true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(userRouter);
app.use(adminRouter);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
