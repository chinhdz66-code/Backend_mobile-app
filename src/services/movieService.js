const movieModel = require('../models/movieModel');

// xử lý lấy danh sách phim đang chiếu
const layPhimDangChieu = async () => {
    // Đang chiếu: Phim mới ra mắt (gần đây nhất) xếp lên đầu 
    const movies = await movieModel.layPhimTheoTrangThai('now_showing', 'DESC');
    return movies;
};

// xử lý lấy danh sách phim sắp chiếu
const layPhimSapChieu = async () => {
    // Sắp chiếu: Phim chiếu tuần sau xếp trên, phim chiếu năm sau xếp dưới 
    const movies = await movieModel.layPhimTheoTrangThai('coming_soon', 'ASC');
    return movies;
};

module.exports = {
    layPhimDangChieu,
    layPhimSapChieu
};