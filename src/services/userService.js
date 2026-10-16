const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

const dangKyUser = async (fullName, email, matKhauGoc, phone, gender, dob) => {
    // Độ mặn (salt): 10 là mức chuẩn, số càng to băm càng lâu nhưng càng an toàn
    const saltRounds = 10;
    
    // Tiến hành băm mật khẩu
    const matKhauDaHash = await bcrypt.hash(matKhauGoc, saltRounds);
    
    // Giao mật khẩu đã mã hóa cho Thủ kho đem cất
    const newUserId = await userModel.taoUserMoi(fullName, email, matKhauDaHash, phone, gender, dob);
    
    return newUserId;
};

module.exports = { dangKyUser };