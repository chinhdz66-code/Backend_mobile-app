const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const authMiddleware = require('../middlewares/authMiddleware');

// Phân luồng: Khách dùng lệnh GET gọi vào URL gốc thì giao cho hàm layDanhSachUser
router.get('/', authMiddleware.xacThucToken, authMiddleware.kiemTraAdmin, userController.layDanhSachUser);
router.post('/', userController.taoUser);
router.post('/login', userController.dangNhap);

module.exports = router;