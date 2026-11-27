const pool = require('../database');

// Hàm lấy danh sách đánh giá của một bộ phim theo movieId
const layDanhGiaTheoPhim = async (movieId) => {
    const query = `
        SELECT 
            r.review_id,
            r.user_id,
            u.full_name,
            u.avatar_url,
            r.rating,
            r.comment,
            r.created_at
        FROM Reviews r
        JOIN Users u ON r.user_id = u.user_id
        WHERE r.movie_id = ?
        ORDER BY r.created_at DESC
    `;
    const [rows] = await pool.query(query, [movieId]);
    return rows;
};

// Hàm kiểm tra xem người dùng đã đánh giá bộ phim chưa
const kiemTraDaDanhGia = async (userId, movieId) => {
    const query = 'SELECT review_id FROM Reviews WHERE user_id = ? AND movie_id = ?';
    const [rows] = await pool.query(query, [userId, movieId]);
    return rows.length > 0;
};

// Hàm thêm đánh giá mới cho một bộ phim
const themDanhGia = async (userId, movieId, rating, comment) => {
    const query = 'INSERT INTO Reviews (user_id, movie_id, rating, comment) VALUES (?, ?, ?, ?)';
    const [result] = await pool.query(query, [userId, movieId, rating, comment]);
    return result.insertId;
};

module.exports = {
    layDanhGiaTheoPhim,
    kiemTraDaDanhGia,
    themDanhGia
};