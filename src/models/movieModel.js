const pool = require('../database'); 

// Hàm lấy danh sách phim 
const layPhimTheoTrangThai = async (status, sortOrder = 'DESC') => {
    // Ép kiểu để bảo mật: Chỉ cho phép chữ ASC hoặc DESC lọt vào câu query
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    // Dùng template string `${order}` để nối biến hướng sắp xếp vào SQL
    const query = `SELECT * FROM Movies WHERE status = ? ORDER BY release_date ${order}`;
    
    const [rows] = await pool.query(query, [status]);
    return rows;
};

module.exports = {
    layPhimTheoTrangThai
};