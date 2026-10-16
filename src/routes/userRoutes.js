const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Phân luồng: Khách dùng lệnh GET gọi vào URL gốc thì giao cho hàm layDanhSachUser
router.get('/', userController.layDanhSachUser);

module.exports = router;