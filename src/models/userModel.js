const pool = require('../database');


//hàm lấy danh sách user
const layTatCaUser = async () => {
    // Gọi thẳng await vì pool đã hỗ trợ sẵn Promise
    // Mảng trả về có 2 phần tử, ta dùng destructuring [rows] để lấy phần tử đầu tiên chứa dữ liệu
    const [rows] = await pool.query('SELECT * FROM Users'); 
    
    return rows;
};


//hàm tạo mới user 
const taoUserCoOTP = async (fullName, email, passwordHash, phone, gender, dob, otpCode, otpExpires) => {
    const sql = `
        INSERT INTO Users (full_name, email, password, phone, gender, dob, is_active, otp_code, otp_expires) 
        VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
    `;
    const [result] = await pool.query(sql, [fullName, email, passwordHash, phone, gender, dob, otpCode, otpExpires]);
    return result.insertId;
};

//hàm xác nhận OTP và kích hoạt tài khoản
const kichHoatTaiKhoan = async (email) => {
    const sql = `UPDATE Users SET is_active = 1, otp_code = NULL, otp_expires = NULL WHERE email = ?`;
    const [result] = await pool.query(sql, [email]);
    return result.affectedRows > 0;
};

//hàm cập nhật OTP nếu hết hạn
const capNhatOTP = async (email, otpCode, otpExpires) => {
    const sql = `UPDATE Users SET otp_code = ?, otp_expires = ? WHERE email = ?`;
    const [result] = await pool.query(sql, [otpCode, otpExpires, email]);
    return result.affectedRows > 0;
};

//hàm đăng nhập
const timUserBangEmail = async (email) => {
    const sql = `SELECT * FROM Users WHERE email = ?`;
    const [rows] = await pool.query(sql, [email]);
    return rows.length > 0 ? rows[0] : null; 
};

// cập nhật avatar
const capNhatAvatar = async (userId, avatarUrl) => {
    const sql = 'UPDATE Users SET avatar_url = ? WHERE user_id = ?';
    const [result] = await pool.query(sql, [avatarUrl, userId]);
    return result.affectedRows > 0;
};


// cập nhật thông tin user
const capNhatThongTinUser = async (userId, fullName, phone, gender, dob) => {
    const sql = 'UPDATE Users SET full_name = ?, phone = ?, gender = ?, dob = ? WHERE user_id = ?';
    const [result] = await pool.query(sql, [fullName, phone, gender, dob, userId]);
    return result.affectedRows > 0;
};

// thay đổi mật khẩu password
// 1. Tìm thông tin User theo user_id
const timUserBangId = async (userId) => {
    const [rows] = await pool.query("SELECT * FROM Users WHERE user_id = ?", [userId]);
    return rows.length > 0 ? rows[0] : null;
};
// 2. Cập nhật mật khẩu băm mới vào bảng Users
const capNhatMatKhau = async (userId, newPasswordHash) => {
    const [result] = await pool.query(
        "UPDATE Users SET password = ? WHERE user_id = ?", 
        [newPasswordHash, userId]
    );
    return result.affectedRows > 0;
};

// 3. Quên mật khẩu, cập nhật mật khẩu mới theo email
const quenMatKhau = async (email, newPasswordHash) => {
    const [result] = await pool.query(
        "UPDATE Users SET password = ?, otp_code = NULL, otp_expires = NULL WHERE email = ?", 
        [newPasswordHash, email]
    );
    return result.affectedRows > 0;
};

module.exports = { 
    layTatCaUser, 
    taoUserCoOTP, 
    kichHoatTaiKhoan, 
    capNhatOTP, 
    timUserBangEmail, 
    capNhatAvatar, 
    capNhatThongTinUser, 
    timUserBangId, 
    capNhatMatKhau,
    quenMatKhau
};
