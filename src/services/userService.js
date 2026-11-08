const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const emailService = require('./emailService');

// Xử lý đăng ký user mới
async function dangKyUser(fullName, email, matKhauGoc, phone, gender, dob, otpCode, otpExpires) {
    // Độ mặn (salt): 10 là mức chuẩn
    const saltRounds = 10;

    // Tiến hành băm mật khẩu
    const matKhauDaHash = await bcrypt.hash(matKhauGoc, saltRounds);

    // Giao mật khẩu đã mã hóa cùng mã OTP cho Thủ kho đem cất
    const newUserId = await userModel.taoUserCoOTP(
        fullName, email, matKhauDaHash, phone, gender, dob, otpCode, otpExpires
    );

    return newUserId;
}


//xử lý đăng nhập user
const dangNhapUser = async (email, matKhauNhapVao) => {
    // 1. Nhờ Thủ kho tìm user
    const user = await userModel.timUserBangEmail(email);
    if (!user) {
        throw new Error("Email hoặc mật khẩu không chính xác");
    }

    // Kiểm tra tài khoản đã kích hoạt chưa (OTP)
    if (user.is_active === 0) {
        throw new Error("Tài khoản chưa được kích hoạt");
    }

    // 2. Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(matKhauNhapVao, user.password);
    if (!isMatch) {
        throw new Error("Email hoặc mật khẩu không chính xác");
    }

    // 3. In thẻ Token
    const payload = { 
        user_id: user.user_id, 
        role: user.role 
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { 
        expiresIn: process.env.JWT_EXPIRES_IN 
    });

    // Xóa mật khẩu trước khi trả về
    delete user.password; 
    
    return { token, user };
};

// Xử lý quên mật khẩu
// Hàm 1: Gửi mã OTP về email
const guiOtpQuenMatKhau = async (email) => {
    const user = await userModel.timUserBangEmail(email);
    if (!user) {
        throw new Error("Email không tồn tại trong hệ thống");
    }
    // Kiểm tra tài khoản đã kích hoạt chưa
    if (user.is_active === 0) {
        throw new Error("Tài khoản chưa được kích hoạt");
    }

    // Tạo OTP mới (6 số) và lưu hạn 3 phút
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 3 * 60 * 1000); 

    await userModel.capNhatOTP(email, otpCode, otpExpires);
    await emailService.guiMailOTP(email, otpCode);
    
    return true;
};

// Hàm 2: Xác thực OTP và đặt lại mật khẩu
const datLaiMatKhau = async (email, otpCode, matKhauMoi) => {
    const user = await userModel.timUserBangEmail(email);
    if (!user) throw new Error("Email không tồn tại trong hệ thống");

    // 1. Kiểm tra mã nhập vào có đúng không
    if (user.otp_code !== otpCode) {
        throw new Error("Mã OTP không chính xác");
    }

    // 2. Kiểm tra thời gian xem có bị hết hạn không
    const currentTime = new Date();
    if (currentTime > user.otp_expires) {
        throw new Error("Mã OTP đã hết hạn");
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(matKhauMoi, salt);

    // Gọi hàm quenMatKhau trong Model để lưu mật khẩu
    await userModel.quenMatKhau(email, hashedPassword);
    
    return true;
};

module.exports = { 
    dangKyUser, 
    dangNhapUser,
    guiOtpQuenMatKhau,
    datLaiMatKhau
};