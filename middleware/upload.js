const multer = require("multer")
const path = require("path")

//1. set destination
//2. set filename
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/images'))
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

//3. upload
const store_signature = multer({
    storage: storage
}).single('admin_signature')



module.exports ={
    store_signature
}
