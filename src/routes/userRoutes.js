const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const authMiddleware = require('../middlewares/authMiddleware');

// 1. thư viện multer và path để xử lý file
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


// Phân luồng
// lấy ds users
router.get('/', authMiddleware.xacThucToken, authMiddleware.kiemTraAdmin, userController.layDanhSachUser);

// đăng ký user mới
router.post('/', userController.taoUser);

//xác thực OTP
router.post('/verify-otp', userController.xacThucOTP);
router.post('/resend-otp', userController.guiLaiOTP);

//đăng nhập 
router.post('/login', userController.dangNhap);

//quên mật khẩu và đặt lại mật khẩu
router.post('/forgot-pass', userController.forgotPass);
router.post('/reset-pass', userController.resetPass);

// đổi mật khẩu
router.post('/change-password', authMiddleware.xacThucToken, userController.doiMatKhau);

// profile 
router.get('/profile', authMiddleware.xacThucToken, userController.layThongTinCaNhan);
router.post('/upload-avatar', authMiddleware.xacThucToken, upload.single('avatar'), userController.uploadAvatar);
router.post('/update-profile', authMiddleware.xacThucToken, userController.capNhatThongTin);

module.exports = router;
