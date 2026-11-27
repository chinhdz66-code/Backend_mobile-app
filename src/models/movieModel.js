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

// Hàm tim kiếm phim theo tên (dùng cho thanh tìm kiếm)
const timKiemTheoTen = async (keyword) => {
    const query = 'SELECT * FROM Movies WHERE title LIKE ? ORDER BY release_date DESC';
    const [rows] = await pool.query(query, [`%${keyword}%`]);
    return rows;
};

// Hàm lọc phim theo nhiều tiêu chí: trạng thái, thể loại, năm phát hành
const locPhimNangCao = async (status, genre, year) => {
    let query = 'SELECT * FROM Movies WHERE 1=1';
    let params = [];

    if (status) {
        query += ' AND status = ?';
        params.push(status);
    }
    if (genre) {
        query += ' AND genre LIKE ?';
        params.push(`%${genre}%`);
    }
    if (year) {
        // Hàm YEAR() trích xuất số năm (VD: 2024) từ chuỗi ngày tháng 2024-02-10
        query += ' AND YEAR(release_date) = ?';
        params.push(year); 
    }

    query += ' ORDER BY release_date DESC';

    const [rows] = await pool.query(query, params);
    return rows;
};

// Hàm lấy chi tiết phim theo movieId, bao gồm cả đánh giá trung bình và tổng số đánh giá
const layChiTietPhim = async (movieId) => {
    const query = `
        SELECT 
            m.*, 
            ROUND(IFNULL(AVG(r.rating) * 2, 0), 1) AS avg_rating,
            COUNT(r.review_id) AS total_reviews
        FROM Movies m
        LEFT JOIN Reviews r ON m.movie_id = r.movie_id
        WHERE m.movie_id = ?
        GROUP BY m.movie_id
    `;
    const [rows] = await pool.query(query, [movieId]);
    return rows[0];
};


module.exports = {
    layPhimTheoTrangThai,
    timKiemTheoTen,
    locPhimNangCao,
    layChiTietPhim
};