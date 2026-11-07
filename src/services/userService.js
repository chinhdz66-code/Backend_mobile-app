const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Xử lý đăng ký user mới
const dangKyUser = async (fullName, email, matKhauGoc, phone, gender, dob, otpCode, otpExpires) => {
    // Độ mặn (salt): 10 là mức chuẩn
    const saltRounds = 10;
    
    // Tiến hành băm mật khẩu
    const matKhauDaHash = await bcrypt.hash(matKhauGoc, saltRounds);
    
    // Giao mật khẩu đã mã hóa cùng mã OTP cho Thủ kho đem cất
    const newUserId = await userModel.taoUserCoOTP(
    fullName, email, matKhauDaHash, phone, gender, dob, otpCode, otpExpires
    );
    
    return newUserId;
};


//xử lý đăng nhập user
const dangNhapUser = async (email, matKhauNhapVao) => {
    // 1. Nhờ Thủ kho tìm user
    const user = await userModel.timUserBangEmail(email);
    if (!user) {
        throw new Error("Email hoặc mật khẩu không chính xác");
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

module.exports = { dangKyUser, dangNhapUser };