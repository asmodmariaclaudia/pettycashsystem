const multer = require("multer");
const path = require("path");

// 1. Define storage destination and filename
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/images'));
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// 2. Define the upload middleware
const store_resibo = multer({
    storage: storage
}).single('receiptsUpload');

module.exports = {
    store_resibo
};
