const pool = require('../database');

const layTatCaUser = async () => {
    // Gọi thẳng await vì pool đã hỗ trợ sẵn Promise
    // Mảng trả về có 2 phần tử, ta dùng destructuring [rows] để lấy phần tử đầu tiên chứa dữ liệu
    const [rows] = await pool.query('SELECT * FROM Users'); 
    
    return rows;
};

module.exports = { layTatCaUser };