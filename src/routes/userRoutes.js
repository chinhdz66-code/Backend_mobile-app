const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const authMiddleware = require('../middlewares/authMiddleware');

// 1. Thêm thư viện multer và path để xử lý file
const multer = require('multer');
const path = require('path');


// 2. Cấu hình vị trí lưu và đặt tên file tự động (tránh trùng lặp tên)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/avatars/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// 3. Thêm Route upload ảnh đại diện & cập nhật thông tin
router.post('/upload-avatar', upload.single('avatar'), userController.uploadAvatar);
router.post('/update-profile', userController.capNhatThongTin);

// Phân luồng: Khách dùng lệnh GET gọi vào URL gốc thì giao cho hàm layDanhSachUser
router.get('/', authMiddleware.xacThucToken, authMiddleware.kiemTraAdmin, userController.layDanhSachUser);
router.post('/', userController.taoUser);
router.post('/login', userController.dangNhap);
router.post('/change-password', userController.doiMatKhau);
module.exports = router;
