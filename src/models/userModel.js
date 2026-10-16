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

module.exports = { layTatCaUser, taoUserMoi };