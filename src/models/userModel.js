const pool = require('../database');


//hàm lấy danh sách user
const layTatCaUser = async () => {
    // Gọi thẳng await vì pool đã hỗ trợ sẵn Promise
    // Mảng trả về có 2 phần tử, ta dùng destructuring [rows] để lấy phần tử đầu tiên chứa dữ liệu
    const [rows] = await pool.query('SELECT * FROM Users'); 
    
    return rows;
};


//hàm tạo mới user 
const taoUserMoi = async (fullName, email, matKhauDaHash, phone, gender, dob) => {
    // Dùng dấu ? để truyền dữ liệu an toàn
    const sql = `INSERT INTO Users (full_name, email, password, phone, gender, dob) VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.query(sql, [fullName, email, matKhauDaHash, phone, gender, dob]);
    
    // insertId chính là cái ID tự tăng (AUTO_INCREMENT) mà Aiven vừa cấp cho khách
    return result.insertId; 
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


module.exports = { layTatCaUser, taoUserMoi, timUserBangEmail, capNhatAvatar, capNhatThongTinUser, timUserBangId, capNhatMatKhau};
