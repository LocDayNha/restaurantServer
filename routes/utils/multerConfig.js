const multer = require('multer');

// Cấu hình Multer để lưu trữ tệp trong bộ nhớ tạm trước khi upload lên Firebase
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = upload;