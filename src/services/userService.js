const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');

//xử lý đăng ký user mới
const dangKyUser = async (fullName, email, matKhauGoc, phone, gender, dob) => {
    // Độ mặn (salt): 10 là mức chuẩn, số càng to băm càng lâu nhưng càng an toàn
    const saltRounds = 10;
    
    // Tiến hành băm mật khẩu
    const matKhauDaHash = await bcrypt.hash(matKhauGoc, saltRounds);
    
    // Giao mật khẩu đã mã hóa cho Thủ kho đem cất
    const newUserId = await userModel.taoUserMoi(fullName, email, matKhauDaHash, phone, gender, dob);
    
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

    // 3. In thẻ Token (sử dụng JWT_SECRET từ .env hoặc fallback nếu chưa nhận)
    const payload = { 
        user_id: user.user_id, 
        role: user.role 
    };
    
    const secretKey = process.env.JWT_SECRET || 'cqs_cinema_secret_key_2026';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    const token = jwt.sign(payload, secretKey, {
        expiresIn: expiresIn
    });

    // Xóa mật khẩu trước khi trả về
    delete user.password; 
    
    return { token, user };
};

const doiMatKhau = async (userId, oldPassword, newPassword) => {
    // 1. Kiểm tra sự tồn tại của User
    const user = await userModel.timUserBangId(userId);
    if (!user) {
        throw new Error("Người dùng không tồn tại");
    }

    // 2. Đối chiếu mật khẩu hiện tại
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        throw new Error("Mật khẩu hiện tại không chính xác");
    }

    // 3. Đảm bảo mật khẩu mới khác mật khẩu cũ
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
        throw new Error("Mật khẩu mới không được trùng với mật khẩu cũ");
    }

    // 4. Băm mật khẩu mới
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // 5. Lưu vào Database
    return await userModel.capNhatMatKhau(userId, newPasswordHash);
};

module.exports = { dangKyUser, dangNhapUser, doiMatKhau };
